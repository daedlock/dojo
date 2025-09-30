{ pkgs }:

pkgs.stdenv.mkDerivation {
  name = "claude-cli";

  buildInputs = [ pkgs.nodejs ];

  unpackPhase = "true";

  installPhase = ''
    mkdir -p $out/bin
    cat > $out/bin/claude <<'EOF'
#!/usr/bin/env bash
exec ${pkgs.nodejs}/bin/npx @anthropic-ai/claude "$@"
EOF
    chmod +x $out/bin/claude
  '';
}