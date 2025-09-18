import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Terminal, Code, Monitor } from 'lucide-react'
import { TerminalService } from './TerminalService'
import { CodeService } from './CodeService'
import { DesktopService } from './DesktopService'

interface WorkspaceProps {
  className?: string
}

export function Workspace({ className }: WorkspaceProps) {
  const [activeService, setActiveService] = useState<string>('terminal')

  const services = [
    {
      id: 'terminal',
      name: 'Terminal',
      icon: Terminal,
      component: TerminalService,
      description: 'Command line interface'
    },
    {
      id: 'code',
      name: 'VS Code',
      icon: Code,
      component: CodeService,
      description: 'Code editor'
    },
    {
      id: 'desktop',
      name: 'Desktop',
      icon: Monitor,
      component: DesktopService,
      description: 'GUI desktop environment'
    }
  ]

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {services.map((service) => {
              const Icon = service.icon
              const isActive = activeService === service.id
              return (
                <Button
                  key={service.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveService(service.id)}
                  className="flex items-center gap-2 flex-1"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{service.name}</span>
                </Button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-full">
            {services.map((service) => {
              const ServiceComponent = service.component
              return (
                <ServiceComponent
                  key={service.id}
                  isActive={activeService === service.id}
                  className="h-full"
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}