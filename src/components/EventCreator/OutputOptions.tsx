'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Lock } from 'lucide-react';
import { Button, Tabs, Tab, Card, CardBody, Tooltip, Badge } from '@heroui/react';
import { useEventContext } from '@/contexts/EventContext';
import { useCheckEventQuota } from '@/hooks/useCheckEventQuota';
import toast from 'react-hot-toast';
import { generateInlineEmbedCode } from '@/utils/embedCodeGenerator';

export default function OutputOptions() {
  const { eventData, buttonData, outputType, setOutput, generatedCode } = useEventContext();
  const { checkQuota } = useCheckEventQuota();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);

  // Load quota on mount
  useEffect(() => {
    checkQuota().then(setQuotaStatus);
  }, [checkQuota]);

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate embed code
  const embedCode = generateInlineEmbedCode(eventData, buttonData, {}, 'punktual-calendar');

  return (
    <div className="space-y-6">
      {/* Quota Info Banner */}
      {quotaStatus && !quotaStatus.canCreateEvent && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="font-medium text-red-900">Monthly Event Limit Reached</p>
            <p className="text-sm text-red-700 mt-1">
              You've created {quotaStatus.eventsCreated} events this month. Your quota resets on{' '}
              {new Date(quotaStatus.quotaResetDate).toLocaleDateString()}.
            </p>
          </div>
        </div>
      )}

      {quotaStatus && quotaStatus.eventsRemaining < 3 && quotaStatus.eventsRemaining > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <span className="text-xl mt-0.5">📊</span>
          <div>
            <p className="font-medium text-amber-900">You have {quotaStatus.eventsRemaining} event{quotaStatus.eventsRemaining === 1 ? '' : 's'} remaining</p>
            <p className="text-sm text-amber-700 mt-1">
              Your free monthly quota resets on {new Date(quotaStatus.quotaResetDate).toLocaleDateString()}.
            </p>
          </div>
        </div>
      )}

      {/* Output Type Tabs */}
      <Tabs
        aria-label="Output type"
        color="success"
        variant="bordered"
        selectedKey={outputType}
        onSelectionChange={(key) => setOutput(key as string)}
        classNames={{
          tabList: 'w-full',
          tab: 'px-4 py-2'
        }}
      >
        {/* HTML/CSS Option */}
        <Tab key="links" title="HTML/CSS">
          <Card className="border border-slate-200">
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Complete HTML Code</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Copy this code to your website. It includes all styling and is ready to use.
                </p>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                  {generatedCode}
                </pre>
                <Tooltip content={copiedCode === 'htmlcss' ? 'Copied!' : 'Copy to clipboard'}>
                  <Button
                    isIconOnly
                    className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600"
                    size="sm"
                    onClick={() => handleCopyCode(generatedCode, 'htmlcss')}
                  >
                    {copiedCode === 'htmlcss' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                ℹ️ This code is self-contained and doesn't require any external dependencies.
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Embed Code Option */}
        <Tab key="embed" title="Embed Code">
          <Card className="border border-slate-200">
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Inline Script Embed</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Use this lightweight script to embed the calendar buttons on your website. No dependencies required.
                </p>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                  {embedCode}
                </pre>
                <Tooltip content={copiedCode === 'embed' ? 'Copied!' : 'Copy to clipboard'}>
                  <Button
                    isIconOnly
                    className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600"
                    size="sm"
                    onClick={() => handleCopyCode(embedCode, 'embed')}
                  >
                    {copiedCode === 'embed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </Tooltip>
              </div>

              <div className="space-y-2 text-sm">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                  ℹ️ This script works on any website and is fully responsive.
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">Installation Tips:</p>
                  <ul className="text-slate-700 space-y-1 list-disc list-inside">
                    <li>Paste the code anywhere in your HTML body</li>
                    <li>The buttons will automatically appear</li>
                    <li>Customize colors in the EventCreator before copying</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>

        {/* Event Page Option - Coming Soon */}
        <Tab
          key="page"
          title={
            <div className="flex items-center gap-2">
              Event Page
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
          }
          isDisabled
        >
          <Card className="border border-slate-200">
            <CardBody className="space-y-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Event Page - Coming Soon</h3>
                <p className="text-slate-600 max-w-sm mx-auto">
                  Create a beautiful public event page with RSVP tracking, social sharing, and event details.
                  This feature will be available soon!
                </p>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Additional Info */}
      <Card className="bg-emerald-50 border border-emerald-200">
        <CardBody className="space-y-2">
          <p className="text-sm font-medium text-emerald-900">💡 Pro Tip</p>
          <p className="text-sm text-emerald-800">
            After you save this event, you'll get short links for each calendar platform that you can share directly with your users.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
