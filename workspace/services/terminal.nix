{ pkgs }:

let
  service = import ./service.nix { inherit pkgs; };

  serviceScript = pkgs.writeScript "dojo-terminal" ''
    #!${pkgs.bash}/bin/bash

    until [ -f /run/dojo/var/ready ]; do sleep 0.1; done

    export TERM=xterm-256color

    # Setup fish configuration
    mkdir -p /home/hacker/.config/fish

    # Create our default config
    cat > /home/hacker/.config/fish/config.fish.orig << 'EOF'

if status is-interactive
    # Commands to run in interactive sessions can go here
    set fish_greeting
    #neofetch
end


# Basic aliases
alias ll="ls -la"
alias l="eza -lah --icons --group-directories-first"
alias v="nvim"

# Fast file opener with fzf
function o --description 'Open file with fzf'
    # Use fd for faster file finding with common exclusions
    set -l selected (fd -t f -H -E .git -E node_modules -E .cache | \
                     fzf --preview 'bat --color=always --style=numbers --line-range=:100 {} 2>/dev/null || head -100 {}' \
                         --preview-window='right:50%:wrap' \
                         --bind='ctrl-/:toggle-preview' \
                         --height=80% \
                         --layout=reverse)

    # Only open if a file was selected
    if test -n "$selected"
        v $selected
    end
end

# Bind Ctrl+O to the o function
bind \co 'o; commandline -f repaint'

EOF

    # Use our config if user doesn't have one
    if [ ! -f /home/hacker/.config/fish/config.fish ]; then
        cp /home/hacker/.config/fish/config.fish.orig /home/hacker/.config/fish/config.fish
    fi
    chown -R hacker:hacker /home/hacker/.config

    # Define theme presets
    MATRIX_THEME='{
      "foreground": "#00ff41",
      "background": "#000a00",
      "cursor": "#00ff41",
      "cursorAccent": "#0a1a0a",
      "selectionBackground": "#1a2a1a",
      "selectionForeground": "#00ff41",
      "black": "#051005",
      "red": "#ff3333",
      "green": "#00ff41",
      "yellow": "#39ff72",
      "blue": "#00e639",
      "magenta": "#00cc28",
      "cyan": "#00b322",
      "white": "#00ff41",
      "brightBlack": "#0a1a0a",
      "brightRed": "#ff3333",
      "brightGreen": "#39ff72",
      "brightYellow": "#00e639",
      "brightBlue": "#00cc28",
      "brightMagenta": "#008f11",
      "brightCyan": "#00b322",
      "brightWhite": "#39ff72"
    }'

    AMETHYST_THEME='{
      "foreground": "#c084fc",
      "background": "#111827",
      "cursor": "#a855f7",
      "cursorAccent": "#1f2937",
      "selectionBackground": "#e879f9",
      "selectionForeground": "#111827",
      "black": "#111827",
      "red": "#f87171",
      "green": "#34d399",
      "yellow": "#fbbf24",
      "blue": "#60a5fa",
      "magenta": "#c084fc",
      "cyan": "#22d3ee",
      "white": "#f9fafb",
      "brightBlack": "#374151",
      "brightRed": "#f87171",
      "brightGreen": "#34d399",
      "brightYellow": "#fbbf24",
      "brightBlue": "#60a5fa",
      "brightMagenta": "#e879f9",
      "brightCyan": "#22d3ee",
      "brightWhite": "#f9fafb"
    }'

    SOLARIZED_DARK_THEME='{
      "foreground": "#839496",
      "background": "#002b36",
      "cursor": "#839496",
      "cursorAccent": "#073642",
      "selectionBackground": "#586e75",
      "selectionForeground": "#839496",
      "black": "#073642",
      "red": "#dc322f",
      "green": "#859900",
      "yellow": "#b58900",
      "blue": "#268bd2",
      "magenta": "#d33682",
      "cyan": "#2aa198",
      "white": "#eee8d5",
      "brightBlack": "#002b36",
      "brightRed": "#cb4b16",
      "brightGreen": "#586e75",
      "brightYellow": "#657b83",
      "brightBlue": "#839496",
      "brightMagenta": "#6c71c4",
      "brightCyan": "#93a1a1",
      "brightWhite": "#fdf6e3"
    }'

    EVERFOREST_THEME='{
      "foreground": "#d3c6aa",
      "background": "#2d353b",
      "cursor": "#d3c6aa",
      "cursorAccent": "#374145",
      "selectionBackground": "#503946",
      "selectionForeground": "#d3c6aa",
      "black": "#374145",
      "red": "#e67e80",
      "green": "#a7c080",
      "yellow": "#dbbc7f",
      "blue": "#7fbbb3",
      "magenta": "#d699b6",
      "cyan": "#83c092",
      "white": "#d3c6aa",
      "brightBlack": "#414b50",
      "brightRed": "#e67e80",
      "brightGreen": "#a7c080",
      "brightYellow": "#dbbc7f",
      "brightBlue": "#7fbbb3",
      "brightMagenta": "#d699b6",
      "brightCyan": "#83c092",
      "brightWhite": "#d3c6aa"
    }'

    GRUVBOX_THEME='{
      "foreground": "#ebdbb2",
      "background": "#282828",
      "cursor": "#ebdbb2",
      "cursorAccent": "#3c3836",
      "selectionBackground": "#504945",
      "selectionForeground": "#ebdbb2",
      "black": "#282828",
      "red": "#cc241d",
      "green": "#98971a",
      "yellow": "#d79921",
      "blue": "#458588",
      "magenta": "#b16286",
      "cyan": "#689d6a",
      "white": "#a89984",
      "brightBlack": "#928374",
      "brightRed": "#fb4934",
      "brightGreen": "#b8bb26",
      "brightYellow": "#fabd2f",
      "brightBlue": "#83a598",
      "brightMagenta": "#d3869b",
      "brightCyan": "#8ec07c",
      "brightWhite": "#ebdbb2"
    }'

    # Select theme based on environment variable, default to matrix
    echo "[TERMINAL] TERMINAL_THEME_NAME environment variable: ''${TERMINAL_THEME_NAME:-"<not set>"}" >&2
    case "''${TERMINAL_THEME_NAME:-matrix}" in
      "matrix")
        THEME="$MATRIX_THEME"
        echo "[TERMINAL] Selected matrix theme" >&2
        ;;
      "amethyst")
        THEME="$AMETHYST_THEME"
        echo "[TERMINAL] Selected amethyst theme" >&2
        ;;
      "solarized")
        THEME="$SOLARIZED_DARK_THEME"
        echo "[TERMINAL] Selected solarized theme" >&2
        ;;
      "everforest")
        THEME="$EVERFOREST_THEME"
        echo "[TERMINAL] Selected everforest theme" >&2
        ;;
      "gruvbox")
        THEME="$GRUVBOX_THEME"
        echo "[TERMINAL] Selected gruvbox theme" >&2
        ;;
      *)
        THEME="$MATRIX_THEME"
        echo "[TERMINAL] Using default matrix theme for unknown: ''${TERMINAL_THEME_NAME}" >&2
        ;;
    esac

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
        -t 'rendererType=webgl' \
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
    # System info
    neofetch
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
    ln -s ${pkgs.neofetch}/bin/neofetch $out/bin/neofetch

    runHook postInstall
  '';
}
