FROM python:3.11-slim

RUN pip install --no-cache-dir psycopg2-binary pycryptodome docker

COPY vnc_proxy.py /vnc_proxy.py

CMD ["python3", "-u", "/vnc_proxy.py"]