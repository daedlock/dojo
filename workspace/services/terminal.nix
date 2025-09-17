{ pkgs }:

let
  service = import ./service.nix { inherit pkgs; };

  serviceScript = pkgs.writeScript "dojo-terminal" ''
    #!${pkgs.bash}/bin/bash

    until [ -f /run/dojo/var/ready ]; do sleep 0.1; done

    export TERM=xterm-256color

    # Setup fish configuration with oh-my-fish and chain theme
    mkdir -p /home/hacker/.config/fish
    cat > /home/hacker/.config/fish/config.fish << 'EOF'
# Basic aliases
alias ll="ls -la"
alias l="eza -lah --icons --group-directories-first"
alias v="nvim"
EOF
    chown -R hacker:hacker /home/hacker/.config

    # Everforest Dark theme colors
    THEME='{
      "foreground": "#d3c6aa",
      "background": "#2d353b",
      "cursor": "#d3c6aa",
      "cursorAccent": "#2d353b",
      "selectionBackground": "#475258",
      "selectionForeground": "#d3c6aa",
      "black": "#475258",
      "red": "#e67e80",
      "green": "#a7c080",
      "yellow": "#dbbc7f",
      "blue": "#7fbbb3",
      "magenta": "#d699b6",
      "cyan": "#83c092",
      "white": "#d3c6aa",
      "brightBlack": "#475258",
      "brightRed": "#e67e80",
      "brightGreen": "#a7c080",
      "brightYellow": "#dbbc7f",
      "brightBlue": "#7fbbb3",
      "brightMagenta": "#d699b6",
      "brightCyan": "#83c092",
      "brightWhite": "#d3c6aa"
    }'

    ${service}/bin/dojo-service start terminal-service/ttyd \
      ${pkgs.ttyd}/bin/ttyd \
        --port 7681 \
        --interface 0.0.0.0 \
        --writable \
        -t disableLeaveAlert=true \
        -t 'fontSize=14' \
        -t 'fontFamily=JetBrainsMono Nerd Font, DejaVu Sans Mono, Consolas, Monaco, Menlo, Courier New, monospace' \
        -t "theme=$THEME" \
        -t 'cursorStyle=block' \
        -t 'cursorBlink=true' \
        -t 'scrollback=10000' \
        -t 'lineHeight=1.2' \
        -t 'scrollOnKey=true' \
        -t 'scrollOnOutput=true' \
        -t 'scrollSensitivity=1' \
        ${pkgs.fish}/bin/fish --login

    until ${pkgs.curl}/bin/curl -fs localhost:7681 >/dev/null; do sleep 0.1; done
  '';

in pkgs.stdenv.mkDerivation {
  name = "terminal-service";
  buildInputs = with pkgs; [
    ttyd
    bashInteractive
    zsh
    fish
    neovim
    curl
    # Dependencies for Mason LSP servers
    wget
    unzip
    gnutar
    gzip
    nodejs
    nodePackages.npm
    python3
    python3Packages.pip
    gcc
    # Search and navigation tools
    ripgrep
    fzf
    fd
    bat
    eza
    # Nerd Font for icons
    nerd-fonts.jetbrains-mono
  ];
  dontUnpack = true;

  installPhase = ''
    runHook preInstall

    mkdir -p $out/bin
    cp ${serviceScript} $out/bin/dojo-terminal
    chmod +x $out/bin/dojo-terminal
    ln -s ${pkgs.ttyd}/bin/ttyd $out/bin/ttyd
    ln -s ${pkgs.ttyd}/bin/ttyd $out/bin/terminal
    ln -s ${pkgs.zsh}/bin/zsh $out/bin/zsh
    ln -s ${pkgs.fish}/bin/fish $out/bin/fish
    ln -s ${pkgs.neovim}/bin/nvim $out/bin/nvim
    ln -s ${pkgs.neovim}/bin/nvim $out/bin/vim
    ln -s ${pkgs.ripgrep}/bin/rg $out/bin/rg
    ln -s ${pkgs.fzf}/bin/fzf $out/bin/fzf
    ln -s ${pkgs.fd}/bin/fd $out/bin/fd
    ln -s ${pkgs.bat}/bin/bat $out/bin/bat
    ln -s ${pkgs.eza}/bin/eza $out/bin/eza

    runHook postInstall
  '';
}
