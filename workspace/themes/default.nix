{ pkgs }:

let
  # Import all theme files
  matrix = import ./matrix.nix;
  everforest = import ./everforest.nix;
  gruvbox = import ./gruvbox.nix;
  amethyst = import ./amethyst.nix;
  solarized = import ./solarized.nix;

  # Helper function to convert terminal colors to JSON
  terminalToJson = theme: pkgs.writeText "terminal-theme.json" (builtins.toJSON theme.terminal);

  # Helper function to convert VS Code colors to JSON with proper theme selection
  vscodeToJson = themeName: theme: pkgs.writeText "vscode-theme.json" (builtins.toJSON (
    let
      baseSettings = {
        "window.autoDetectColorScheme" = false;
        "window.commandCenter" = false;
        "workbench.layoutControl.enabled" = false;
      };
    in
    if themeName == "gruvbox" then
      baseSettings // {
        "workbench.colorTheme" = "Gruvbox Crisp Dark Soft";
        "workbench.preferredDarkColorTheme" = "Gruvbox Crisp Dark Soft";
      }
    else if themeName == "everforest" then
      baseSettings // {
        "workbench.colorTheme" = "Everblush";
        "workbench.preferredDarkColorTheme" = "Everblush";
      }
    else if themeName == "solarized" then
      baseSettings // {
        "workbench.colorTheme" = "Solarized Dark";
        "workbench.preferredDarkColorTheme" = "Solarized Dark";
      }
    else if themeName == "amethyst" then
      baseSettings // {
        "workbench.colorTheme" = "Default Dark+";
        "workbench.preferredDarkColorTheme" = "Default Dark+";
        "workbench.colorCustomizations" = theme.vscode;
      }
    else # matrix and any other custom themes
      baseSettings // {
        "workbench.colorTheme" = "Default Dark+";
        "workbench.preferredDarkColorTheme" = "Default Dark+";
        "workbench.colorCustomizations" = theme.vscode;
      }
  ));

  # Available themes
  themes = {
    inherit matrix everforest gruvbox amethyst solarized;
  };

  # Function to get theme by name with fallback
  getTheme = name: themes.${name} or themes.matrix;

in {
  inherit themes getTheme terminalToJson vscodeToJson;

  # Export specific functions for services
  getTerminalTheme = name: terminalToJson (getTheme name);
  getVSCodeTheme = name: vscodeToJson name (getTheme name);
}