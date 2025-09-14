{ pkgs }:

pkgs.writeShellScriptBin "dojo-zsh-setup" ''
  #!${pkgs.bash}/bin/bash
  
  # Setup oh-my-zsh for the hacker user if not already done
  if [ ! -d /home/hacker/.oh-my-zsh ]; then
    export HOME=/home/hacker
    export ZSH=/home/hacker/.oh-my-zsh
    
    # Clone oh-my-zsh
    ${pkgs.git}/bin/git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git $ZSH 2>/dev/null || true
    
    # Create default .zshrc if it doesn't exist
    if [ ! -f /home/hacker/.zshrc ]; then
      cat > /home/hacker/.zshrc << 'EOF'
export ZSH="/home/hacker/.oh-my-zsh"
ZSH_THEME="agnoster"
plugins=(git docker python golang rust)
source $ZSH/oh-my-zsh.sh

# Custom aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'

# Set PATH to include challenge and dojo bins
export PATH="/run/challenge/bin:/run/dojo/bin:$PATH"
EOF
    fi
    
    # Fix permissions
    chown -R hacker:hacker /home/hacker/.oh-my-zsh /home/hacker/.zshrc 2>/dev/null || true
  fi
''