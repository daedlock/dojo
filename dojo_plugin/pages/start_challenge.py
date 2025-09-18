from flask import request, Blueprint, jsonify
from CTFd.utils.decorators import authed_only
from CTFd.utils.user import get_current_user
from CTFd.plugins import bypass_csrf_protection

from ..api.v1.docker import start_challenge

start_challenge_page = Blueprint("start_challenge", __name__)

@start_challenge_page.route("/start-challenge", methods=["POST"])
@authed_only
@bypass_csrf_protection
def start_challenge_endpoint():
    """Start a challenge - page-based endpoint that bypasses CORS restrictions"""
    try:
        data = request.get_json()
        dojo_id = data.get("dojo")
        module_id = data.get("module") 
        challenge_id = data.get("challenge")
        practice = data.get("practice", False)
        
        user = get_current_user()
        
        # Import the dojo module functions we need
        from ..utils.dojo import dojo_accessible
        from ..models import DojoModules, DojoChallenges
        from ..utils import is_challenge_locked
        
        # Validate dojo access
        dojo = dojo_accessible(dojo_id)
        if not dojo:
            return jsonify({"success": False, "error": "Invalid dojo"}), 400

        # Validate challenge
        dojo_challenge = (
            DojoChallenges.query.filter_by(id=challenge_id)
            .join(DojoModules.query.filter_by(dojo=dojo, id=module_id).subquery())
            .first()
        )
        if not dojo_challenge:
            return jsonify({"success": False, "error": "Invalid challenge"}), 400

        if not dojo_challenge.visible() and not dojo.is_admin():
            return jsonify({"success": False, "error": "Invalid challenge"}), 400

        if practice and not dojo_challenge.allow_privileged:
            return jsonify({
                "success": False,
                "error": "This challenge does not support practice mode.",
            }), 400

        if is_challenge_locked(dojo_challenge, user):
            return jsonify({
                "success": False,
                "error": "This challenge is locked"
            }), 400

        # Call the docker start function
        result = start_challenge(user, dojo_challenge, practice)
        
        return jsonify({"success": True, "message": "Challenge started successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500