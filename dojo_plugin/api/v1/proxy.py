from flask import request
from flask_restx import Namespace, Resource
from CTFd.utils.decorators import authed_only
from CTFd.plugins import bypass_csrf_protection

from .docker import RunDocker

proxy_namespace = Namespace(
    "proxy", description="Proxy endpoints for cross-origin requests"
)

@proxy_namespace.route("/docker")
class DockerProxy(Resource):
    @bypass_csrf_protection
    def options(self):
        """Handle preflight CORS requests"""
        return '', 204
    
    @authed_only
    @bypass_csrf_protection
    def post(self):
        """Proxy docker requests to bypass cross-origin restrictions"""
        # Create a mock docker endpoint instance and call its post method
        docker_endpoint = RunDocker()
        return docker_endpoint.post()