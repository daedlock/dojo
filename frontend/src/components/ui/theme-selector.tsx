import { Check, ChevronDown, Palette, Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme/ThemeProvider'

type ThemePalette = 'amethyst' | 'everforest'

interface ThemeOption {
  value: ThemePalette
  label: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

const themes: ThemeOption[] = [
  {
    value: 'amethyst',
    label: 'Amethyst',
    description: 'Purple-toned professional theme',
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#e879f9'
    }
  },
  {
    value: 'everforest',
    label: 'Everforest',
    description: 'Green forest-inspired theme',
    colors: {
      primary: '#8da101',  /* green light */
      secondary: '#a7c080', /* green dark */
      accent: '#7fbbb3'    /* blue */
    }
  }
]

export function ThemeSelector() {
  const { palette, mode, setPalette, toggleMode } = useTheme()

  const getModeIcon = () => {
    switch (mode) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mode Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMode}
        className="h-9 w-9 p-0"
      >
        {getModeIcon()}
        <span className="sr-only">Toggle theme mode</span>
      </Button>

      {/* Theme Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">
              {themes.find(t => t.value === palette)?.label}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themes.map((themeOption) => (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setPalette(themeOption.value)}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.secondary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: themeOption.colors.accent }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
              </div>
              {palette === themeOption.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}