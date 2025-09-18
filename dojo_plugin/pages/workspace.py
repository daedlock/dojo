import hmac
import re

from flask import request, Blueprint, render_template, abort, Response
from CTFd.models import Users
from CTFd.utils.user import get_current_user
from CTFd.utils.decorators import authed_only
from CTFd.plugins import bypass_csrf_protection

from ..models import Dojos
from ..utils import redirect_user_socket, get_current_container, container_password, user_ipv4
from ..utils.dojo import get_current_dojo_challenge
import requests


workspace = Blueprint("pwncollege_workspace", __name__)
port_names = {
    "challenge": 80,
    "terminal": 7681,
    "code": 8080,
    "desktop": 6080,
    "desktop-windows": 6082,
}


@workspace.route("/workspace", methods=["GET"])
@authed_only
def view_workspace():

    current_challenge = get_current_dojo_challenge()
    if not current_challenge:
        return render_template("error.html", error="No active challenge session; start a challenge!")

    practice = get_current_container().labels.get("dojo.mode") == "privileged"

    return render_template(
        "workspace.html",
        practice=practice,
        challenge=current_challenge,
    )


@workspace.route("/workspace/<service>")
@authed_only
def view_workspace_service(service):
    return render_template("workspace_service.html", iframe_name="workspace", service=service)

@workspace.route("/workspace/<service>/", websocket=True)
@workspace.route("/workspace/<service>/<path:service_path>", websocket=True)
@workspace.route("/workspace/<service>/", methods=["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"])
@workspace.route("/workspace/<service>/<path:service_path>", methods=["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"])
@authed_only
@bypass_csrf_protection
def forward_workspace(service, service_path=""):
    prefix = f"/workspace/{service}/"
    assert request.full_path.startswith(prefix)
    service_path = request.full_path[len(prefix):]

    if service.count("~") == 0:
        service_name = service
        try:
            user = get_current_user()
            port = int(port_names.get(service_name, service_name))
        except ValueError:
            abort(404)

    elif service.count("~") == 1:
        service_name, user_id = service.split("~", 1)
        try:
            user = Users.query.filter_by(id=int(user_id)).first_or_404()
            port = int(port_names.get(service_name, service_name))
        except ValueError:
            abort(404)

        container = get_current_container(user)
        if not container:
            abort(404)
        dojo = Dojos.from_id(container.labels["dojo.dojo_id"]).first()
        if not dojo.is_admin():
            abort(403)

    elif service.count("~") == 2:
        service_name, user_id, access_code = service.split("~", 2)
        try:
            user = Users.query.filter_by(id=int(user_id)).first_or_404()
            port = int(port_names.get(service_name, service_name))
        except ValueError:
            abort(404)

        container = get_current_container(user)
        if not container:
            abort(404)
        correct_access_code = container_password(container, service_name)
        if not hmac.compare_digest(access_code, correct_access_code):
            abort(403)

    else:
        abort(404)

    current_user = get_current_user()
    if user != current_user:
        print(f"User {current_user.id} is accessing User {user.id}'s workspace (port {port})", flush=True)

    # Debug service and path values
    print(f"DEBUG: service_name='{service_name}', service_path='{service_path}', port={port}")

    # Special handling for terminal service root path to inject CSS
    if service_name == "terminal" and (service_path == "" or service_path == "/"):
        print(f"DEBUG: Calling inject_terminal_css for terminal service")
        return inject_terminal_css(user, port, service_path)

    return redirect_user_socket(user, port, service_path)


def inject_terminal_css(user, port, service_path):
    """Fetch ttyd HTML and inject custom scrollbar CSS"""
    try:
        # Get the original response from ttyd
        url = f"http://{user_ipv4(user)}:{port}/{service_path}"
        print(f"DEBUG: Fetching terminal HTML from {url}")
        response = requests.get(url, timeout=10)
        print(f"DEBUG: Response status: {response.status_code}")
        print(f"DEBUG: Response content-type: {response.headers.get('content-type', 'None')}")

        if response.status_code != 200:
            print(f"DEBUG: Non-200 status, falling back to redirect")
            return redirect_user_socket(user, port, service_path)

        # Only modify HTML responses
        content_type = response.headers.get('content-type', '')
        if 'text/html' not in content_type:
            print(f"DEBUG: Not HTML content, falling back to redirect")
            return redirect_user_socket(user, port, service_path)

        html_content = response.text
        print(f"DEBUG: Original HTML length: {len(html_content)}")
        print(f"DEBUG: HTML preview: {html_content[:500]}...")

        # Custom CSS for subtle scrollbars
        custom_css = """
        <style id="custom-terminal-styles">
        .xterm-viewport::-webkit-scrollbar {
            width: 6px !important;
            height: 6px !important;
        }
        .xterm-viewport::-webkit-scrollbar-track {
            background: rgba(52, 63, 68, 0.3) !important;
            border-radius: 3px !important;
        }
        .xterm-viewport::-webkit-scrollbar-thumb {
            background: rgba(127, 187, 179, 0.3) !important;
            border-radius: 3px !important;
            transition: background 0.2s ease !important;
        }
        .xterm-viewport::-webkit-scrollbar-thumb:hover {
            background: rgba(127, 187, 179, 0.5) !important;
        }
        .xterm-viewport::-webkit-scrollbar-thumb:active {
            background: rgba(127, 187, 179, 0.7) !important;
        }
        .xterm-viewport::-webkit-scrollbar-corner {
            background: transparent !important;
        }
        </style>
        <script>
        console.log("🎨 Custom terminal scrollbar CSS injected successfully!");
        document.addEventListener('DOMContentLoaded', function() {
            console.log("🔍 Looking for xterm viewport elements...");
            const viewports = document.querySelectorAll('.xterm-viewport');
            console.log("📦 Found", viewports.length, "xterm viewport elements");
            if (viewports.length > 0) {
                console.log("✅ Terminal CSS should be applied to scrollbars");
            }
        });
        </script>
        """

        # Inject CSS before closing </head> tag
        injection_success = False
        if '</head>' in html_content:
            html_content = html_content.replace('</head>', custom_css + '</head>')
            injection_success = True
            print("DEBUG: Injected CSS before </head>")
        elif '<head>' in html_content:
            # If no closing head tag, add after opening head tag
            html_content = html_content.replace('<head>', '<head>' + custom_css)
            injection_success = True
            print("DEBUG: Injected CSS after <head>")
        else:
            # If no head tag, add at the beginning of body
            html_content = html_content.replace('<body>', '<body>' + custom_css)
            injection_success = True
            print("DEBUG: Injected CSS at beginning of <body>")

        print(f"DEBUG: CSS injection success: {injection_success}")
        print(f"DEBUG: Modified HTML length: {len(html_content)}")

        # Return modified response
        flask_response = Response(html_content)
        flask_response.headers['Content-Type'] = response.headers.get('content-type', 'text/html')
        print("DEBUG: Returning modified response")
        return flask_response

    except Exception as e:
        print(f"Error injecting terminal CSS: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to original response
        return redirect_user_socket(user, port, service_path)
