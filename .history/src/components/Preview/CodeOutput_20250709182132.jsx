'use client';
import { useState, useEffect } from 'react';
import { trackConversion } from '@/lib/analytics';
import { useEventContext } from '@/contexts/EventContext';
import { 
  Card, 
  CardBody, 
  Button, 
  Tabs, 
  Tab, 
  Switch,
  Chip,
  Code,
  Snippet
} from '@heroui/react';
import { 
  Copy, 
  Download, 
  Code2, 
  FileText, 
  Minimize2, 
  Maximize2,
  Check,
  Eye,
  Settings
} from 'lucide-react';

const CodeOutput = ({ useCase }) => {
  const { generatedCode, calendarLinks, eventData } = useEventContext();
  const [copied, setCopied] = useState(false);
  const [isMinified, setIsMinified] = useState(false);
  const [activeTab, setActiveTab] = useState('html');
  const [includeCSS, setIncludeCSS] = useState(true);
  const [includeJS, setIncludeJS] = useState(true);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackConversion('code_copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadCode = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const minifyCode = (code) => {
    if (!isMinified) return code;
    
    return code
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/\s*}\s*/g, '}')
      .trim();
  };

  const getHTMLCode = () => {
    const baseCode = `<!-- Punktual Generated Code -->
<div class="Punktual-container" data-event-id="${eventData.title?.replace(/\s+/g, '-').toLowerCase()}">
  ${generatedCode}
</div>`;

    return minifyCode(baseCode);
  };

  const getCSSCode = () => {
    const css = `/* Punktual Styles */
.Punktual-container {
  font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
}

.Punktual-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4D90FF 0%, #357ABD 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(77, 144, 255, 0.3);
}

.Punktual-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(77, 144, 255, 0.4);
}

.Punktual-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 200px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.Punktual-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.Punktual-dropdown-item {
  display: block;
  padding: 10px 16px;
  color: #374151;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.Punktual-dropdown-item:hover {
  background: #F3F4F6;
  color: #111827;
}`;

    return minifyCode(css);
  };

  const getJavaScriptCode = () => {
    const js = `// Punktual JavaScript
(function() {
  'use strict';
  
  // Calendar URLs
  const calendarLinks = ${JSON.stringify(calendarLinks, null, 2)};
  
  // Initialize Punktual
  function initPunktual() {
    const buttons = document.querySelectorAll('.Punktual-button');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropdown = this.nextElementSibling;
        if (dropdown && dropdown.classList.contains('Punktual-dropdown')) {
          dropdown.classList.toggle('show');
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.Punktual-container')) {
        const dropdowns = document.querySelectorAll('.Punktual-dropdown.show');
        dropdowns.forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }
    });
  }
  
  // Analytics tracking (optional)
  function trackCalendarClick(platform) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'calendar_add', {
        'event_category': 'Punktual',
        'event_label': platform,
        'value': 1
      });
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPunktual);
  } else {
    initPunktual();
  }
})();`;

    return minifyCode(js);
  };

  const getReactCode = () => {
    return `import React, { useState } from 'react';

const PunktualButton = ({ eventData, platforms = ['google', 'apple', 'outlook'] }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const calendarLinks = {
    google: \`https://calendar.google.com/calendar/render?action=TEMPLATE&text=\${encodeURIComponent(eventData.title)}\`,
    apple: \`data:text/calendar;charset=utf8,BEGIN:VCALENDAR...\`,
    outlook: \`https://outlook.office.com/calendar/0/deeplink/compose?subject=\${encodeURIComponent(eventData.title)}\`
  };
  
  return (
    <div className="Punktual-container relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="Punktual-button"
      >
        📅 Add to Calendar
      </button>
      
      {isOpen && (
        <div className="Punktual-dropdown show">
          {platforms.map(platform => (
            <a 
              key={platform}
              href={calendarLinks[platform]}
              target="_blank"
              rel="noopener noreferrer"
              className="Punktual-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)} Calendar
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default PunktualButton;`;
  };

  const getDirectLinks = () => {
    return Object.entries(calendarLinks)
      .map(([platform, url]) => `${platform.toUpperCase()}: ${url}`)
      .join('\n\n');
  };

  const tabs = [
    {
      key: 'html',
      title: 'HTML',
      icon: <Code2 size={16} />,
      content: getHTMLCode(),
      filename: 'Punktual-button.html'
    },
    {
      key: 'css',
      title: 'CSS',
      icon: <FileText size={16} />,
      content: getCSSCode(),
      filename: 'Punktual-styles.css',
      disabled: !includeCSS
    },
    {
      key: 'js',
      title: 'JavaScript',
      icon: <Settings size={16} />,
      content: getJavaScriptCode(),
      filename: 'Punktual-script.js',
      disabled: !includeJS
    },
    {
      key: 'react',
      title: 'React',
      icon: <Code2 size={16} />,
      content: getReactCode(),
      filename: 'PunktualButton.jsx'
    },
    {
      key: 'links',
      title: 'Direct Links',
      icon: <Eye size={16} />,
      content: getDirectLinks(),
      filename: 'calendar-links.txt'
    }
  ];

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className="space-y-4">
      {/* Header with Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="text-emerald-500" size={20} />
          <h3 className="font-semibold text-gray-800">Generated Code</h3>
          <Chip size="sm" color="success" variant="dot">Ready</Chip>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            isSelected={isMinified}
            onValueChange={setIsMinified}
            startContent={<Minimize2 size={14} />}
            endContent={<Maximize2 size={14} />}
          >
            Minified
          </Switch>
        </div>
      </div>

      {/* Generation Options */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Include:</span>
            <Switch
              size="sm"
              isSelected={includeCSS}
              onValueChange={setIncludeCSS}
            >
              CSS Styles
            </Switch>
            <Switch
              size="sm"
              isSelected={includeJS}
              onValueChange={setIncludeJS}
            >
              JavaScript
            </Switch>
          </div>
        </CardBody>
      </Card>

      {/* Code Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tabs 
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-4 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12"
            }}
          >
            {tabs.map((tab) => (
              <Tab 
                key={tab.key} 
                isDisabled={tab.disabled}
                title={
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.title}</span>
                  </div>
                }
              >
                <div className="p-4 space-y-4">
                  {/* Code Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat">
                        {tab.content.length} characters
                      </Chip>
                      {isMinified && (
                        <Chip size="sm" color="success" variant="flat">
                          Minified
                        </Chip>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={copied ? <Check size={16} /> : <Copy size={16} />}
                        color={copied ? "success" : "default"}
                        onPress={() => copyToClipboard(tab.content)}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Download size={16} />}
                        onPress={() => downloadCode(tab.content, tab.filename)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Code Display */}
                  <Snippet
                    hideSymbol
                    classNames={{
                      base: "w-full",
                      pre: "whitespace-pre-wrap text-xs max-h-96 overflow-y-auto"
                    }}
                  >
                    {tab.content}
                  </Snippet>

                  {/* Usage Instructions */}
                  {tab.key === 'html' && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardBody className="p-3">
                        <div className="text-sm space-y-2">
                          <div className="font-medium text-blue-800">Implementation:</div>
                          <ol className="text-blue-700 space-y-1 text-xs list-decimal list-inside">
                            <li>Copy the HTML code above</li>
                            <li>Paste it into your website where you want the calendar button</li>
                            <li>Include the CSS and JavaScript files if enabled</li>
                            <li>The button will automatically work with all selected platforms</li>
                          </ol>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {tab.key === 'react' && (
                    <Card className="bg-green-50 border-green-200">
                      <CardBody className="p-3">
                        <div className="text-sm space-y-2">
                          <div className="font-medium text-green-800">React Usage:</div>
                          <Code className="text-xs text-green-700">
                            {`<PunktualButton 
  eventData={{
    title: "${eventData.title}",
    date: "${eventData.startDate}",
    time: "${eventData.startTime}"
  }}
  platforms={["google", "apple", "outlook"]}
/>`}
                          </Code>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default CodeOutput;