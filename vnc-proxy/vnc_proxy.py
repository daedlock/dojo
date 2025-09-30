#!/usr/bin/env python3
import socket
import threading
import struct
import hmac
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import docker

DB_HOST = os.environ.get('DB_HOST', 'db')
DB_PORT = int(os.environ.get('DB_PORT', '5432'))
DB_NAME = os.environ.get('DB_NAME', 'ctfd')
DB_USER = os.environ.get('DB_USER', 'ctfd')
DB_PASS = os.environ.get('DB_PASS', 'ctfd')

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        cursor_factory=RealDictCursor
    )

def get_user_container_ip(user_id):
    node_id = 0
    service_id = user_id + 256
    return f"10.{(node_id << 4) | ((service_id >> 16) & 0xff)}.{(service_id >> 8) & 0xff}.{(service_id >> 0) & 0xff}"

def des_encrypt_block(key, block):
    from Crypto.Cipher import DES
    cipher = DES.new(key, DES.MODE_ECB)
    return cipher.encrypt(block)

def reverse_bits_byte(b):
    return ((b >> 7) | ((b & 1) << 7) | ((b & 2) << 5) | ((b & 4) << 3) |
            ((b & 8) << 1) | ((b & 16) >> 1) | ((b & 32) >> 3) |
            ((b & 64) >> 5) | ((b & 128) >> 7))

def verify_vnc_auth(challenge, response, password):
    password_bytes = password.encode()[:8].ljust(8, b'\x00')
    key = bytes([reverse_bits_byte(b) for b in password_bytes])

    expected = b''
    for i in range(0, 16, 8):
        expected += des_encrypt_block(key, challenge[i:i+8])

    return expected == response

def handle_client(client_socket, client_address):
    print(f"[VNC] Connection from {client_address}", flush=True)

    try:
        client_socket.send(b'RFB 003.008\n')
        client_version = client_socket.recv(12)

        if not client_version.startswith(b'RFB '):
            print(f"[VNC] Invalid version", flush=True)
            client_socket.close()
            return

        client_socket.send(struct.pack('!B', 1))
        client_socket.send(struct.pack('!B', 2))

        security_type = struct.unpack('!B', client_socket.recv(1))[0]
        if security_type != 2:
            print(f"[VNC] Unsupported security type", flush=True)
            client_socket.close()
            return

        challenge = os.urandom(16)
        client_socket.send(challenge)
        response = client_socket.recv(16)

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT u.id, u.name
            FROM users u
        """)
        users = cur.fetchall()

        docker_client = docker.from_env()

        authenticated_user = None
        for user in users:
            user_id = user['id']
            username = user['name']

            try:
                container = docker_client.containers.get(f'user_{user_id}')
                auth_token = container.labels.get('dojo.auth_token')
                if not auth_token:
                    print(f"[VNC] No auth token for user {username}", flush=True)
                    continue

                password = hmac.HMAC(auth_token.encode(), b'desktop-interact', 'sha256').hexdigest()[:8]
                print(f"[VNC] Testing user {username} with password {password}", flush=True)

                if verify_vnc_auth(challenge, response, password):
                    authenticated_user = (user_id, username, password)
                    print(f"[VNC] Auth successful for {username}", flush=True)
                    break
                else:
                    print(f"[VNC] Auth failed for {username}", flush=True)
            except docker.errors.NotFound:
                print(f"[VNC] Container not found for user {username}", flush=True)
                continue

        cur.close()
        conn.close()

        if not authenticated_user:
            print(f"[VNC] Auth failed", flush=True)
            client_socket.send(struct.pack('!I', 1))
            client_socket.close()
            return

        user_id, username, password = authenticated_user
        print(f"[VNC] Authenticated: {username} (ID: {user_id})", flush=True)

        client_socket.send(struct.pack('!I', 0))

        container_ip = get_user_container_ip(user_id)
        print(f"[VNC] Connecting to {container_ip}:5900", flush=True)

        backend = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        backend.settimeout(5)
        backend.connect((container_ip, 5900))

        backend.recv(12)
        backend.send(b'RFB 003.008\n')

        num_sec_types = struct.unpack('!B', backend.recv(1))[0]
        sec_types = backend.recv(num_sec_types)

        if b'\x02' not in sec_types:
            print(f"[VNC] Backend doesn't support VNC auth", flush=True)
            backend.close()
            client_socket.close()
            return

        backend.send(struct.pack('!B', 2))

        backend_challenge = backend.recv(16)
        password_bytes = password.encode()[:8].ljust(8, b'\x00')
        key = bytes([reverse_bits_byte(b) for b in password_bytes])

        backend_response = b''
        for i in range(0, 16, 8):
            backend_response += des_encrypt_block(key, backend_challenge[i:i+8])

        backend.send(backend_response)

        auth_result = struct.unpack('!I', backend.recv(4))[0]
        if auth_result != 0:
            print(f"[VNC] Backend auth failed", flush=True)
            client_socket.close()
            backend.close()
            return

        backend.settimeout(None)

        print(f"[VNC] Connected {username}", flush=True)

        def forward(src, dst, name):
            try:
                while True:
                    data = src.recv(8192)
                    if not data:
                        print(f"[VNC] {name} received empty data, closing", flush=True)
                        break
                    dst.sendall(data)
            except Exception as e:
                print(f"[VNC] {name} exception: {e}", flush=True)
            finally:
                try:
                    src.close()
                except:
                    pass
                try:
                    dst.close()
                except:
                    pass

        t1 = threading.Thread(target=forward, args=(client_socket, backend, "c->b"), daemon=True)
        t2 = threading.Thread(target=forward, args=(backend, client_socket, "b->c"), daemon=True)

        t1.start()
        t2.start()

        t1.join()
        t2.join()

        print(f"[VNC] Disconnected {username}", flush=True)

    except Exception as e:
        print(f"[VNC] Error: {e}", flush=True)
    finally:
        try:
            client_socket.close()
        except:
            pass

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(('0.0.0.0', 5900))
    server.listen(10)

    print("[VNC] Proxy listening on 0.0.0.0:5900", flush=True)

    while True:
        try:
            client, addr = server.accept()
            thread = threading.Thread(target=handle_client, args=(client, addr), daemon=True)
            thread.start()
        except Exception as e:
            print(f"[VNC] Accept error: {e}", flush=True)

if __name__ == '__main__':
    main()