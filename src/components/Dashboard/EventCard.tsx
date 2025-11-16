'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Clock, MoreVertical, Edit, Copy, Trash2, ExternalLink, Check, Code, Lock, BarChart3, TrendingUp } from 'lucide-react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure, Tabs, Tab, Card, CardBody } from '@heroui/react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';
import type { EventData, ButtonData } from '@/types';
import { generateInlineEmbedCode } from '@/utils/embedCodeGenerator';
import { generateButtonCode } from '@/utils/calendarGenerator';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';
import { useUserPlan } from '@/hooks/useUserPlan';

interface DatabaseEvent extends EventData {
  id: string;
  user_id: string;
  share_id?: string;
  created_at: string;
  updated_at?: string;
  last_used_at?: string;
}

interface EventCardProps {
  event: DatabaseEvent;
  viewMode: 'grid' | 'list';
  onDelete: () => void;
  onDuplicate: () => void;
  onGenerateCalendar: () => void;
}

export default function EventCard({
  event,
  viewMode,
  onDelete,
  onDuplicate,
  onGenerateCalendar
}: EventCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen: isOutputOpen, onOpen: onOutputOpen, onClose: onOutputClose } = useDisclosure();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState('htmlcss');

  // Analytics and plan hooks
  const { isPro } = useUserPlan();
  const { analytics, isLoading: analyticsLoading } = useEventAnalytics(event.id);

  // Generate code with default button settings (since buttonData isn't saved in DB)
  const generatedCode = useMemo(() => {
    // Default button configuration - individual layout with all major platforms
    const defaultButtonData: ButtonData = {
      buttonLayout: 'individual',
      buttonStyle: 'standard',
      buttonSize: 'medium',
      colorTheme: 'light',
      showIcons: true,
      responsive: true,
      openInNewTab: true,
      selectedPlatforms: {
        google: true,
        apple: true,
        outlook: true,
        office365: true,
        yahoo: true
      }
    };

    return generateButtonCode(event, defaultButtonData, {
      minified: false,
      includeCss: true,
      includeJs: true,
      format: 'html',
      shareId: event.share_id // Use shareId for click tracking
    });
  }, [event, event.share_id]);

  const formatEventDate = (startDate?: string, startTime?: string, isAllDay?: boolean) => {
    if (!startDate) return 'Date not set';
    
    try {
      const date = parseISO(startDate);
      
      if (isAllDay) {
        return format(date, 'MMM d, yyyy');
      }
      
      if (startTime) {
        // Combine date and time for proper formatting
        const [hours, minutes] = startTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
        return format(date, 'MMM d, yyyy at h:mm a');
      }
      
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleMenuAction = (key: string) => {
    setIsMenuOpen(false);

    switch (key) {
      case 'outputs':
        onOutputOpen();
        break;
      case 'edit':
        // Navigate to create page with event data
        // For now, we'll just generate calendar
        onGenerateCalendar();
        break;
      case 'duplicate':
        onDuplicate();
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this event?')) {
          onDelete();
        }
        break;
      case 'generate':
        onGenerateCalendar();
        break;
    }
  };

  // Render the card UI based on view mode
  const cardUI = viewMode === 'list' ? (
    // List view
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {event.title || 'Untitled Event'}
              </h3>

              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{formatEventDate(event.startDate, event.startTime, event.isAllDay)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span className="truncate max-w-48">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>Created {getTimeAgo(event.created_at)}</span>
                </div>

                {event.last_used_at && (
                  <div className="text-emerald-600">
                    Used {getTimeAgo(event.last_used_at)}
                  </div>
                )}

                {/* Analytics badge for pro users */}
                {isPro && analytics && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-medium">
                    <TrendingUp size={14} />
                    <span>{analytics.totalClicks} {analytics.totalClicks === 1 ? 'click' : 'clicks'}</span>
                  </div>
                )}
              </div>
            </div>

            <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownTrigger>
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  className="ml-2"
                >
                  <MoreVertical size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Event actions"
                onAction={(key) => handleMenuAction(key.toString())}
              >
                <DropdownSection title="Actions">
                  <DropdownItem
                    key="outputs"
                    startContent={<Code size={16} />}
                  >
                    View Outputs
                  </DropdownItem>
                  <DropdownItem
                    key="generate"
                    startContent={<ExternalLink size={16} />}
                  >
                    Generate Calendar
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={<Edit size={16} />}
                  >
                    Edit Event
                  </DropdownItem>
                  <DropdownItem
                    key="duplicate"
                    startContent={<Copy size={16} />}
                  >
                    Duplicate
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Trash2 size={16} />}
                  >
                    Delete
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  ) : (
    // Grid view
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 truncate pr-2">
          {event.title || 'Untitled Event'}
        </h3>

        <Dropdown isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownTrigger>
            <Button
              variant="light"
              size="sm"
              isIconOnly
              className="flex-shrink-0"
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Event actions"
            onAction={(key) => handleMenuAction(key.toString())}
          >
            <DropdownSection title="Actions">
              <DropdownItem
                key="outputs"
                startContent={<Code size={16} />}
              >
                View Outputs
              </DropdownItem>
              <DropdownItem
                key="generate"
                startContent={<ExternalLink size={16} />}
              >
                Generate Calendar
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<Edit size={16} />}
              >
                Edit Event
              </DropdownItem>
              <DropdownItem
                key="duplicate"
                startContent={<Copy size={16} />}
              >
                Duplicate
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<Trash2 size={16} />}
              >
                Delete
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>

      {event.description && (
        <p className="text-slate-600 text-sm mb-4 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
          {event.description}
        </p>
      )}

      <div className="space-y-2 text-sm text-slate-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatEventDate(event.startDate, event.startTime, event.isAllDay)}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t">
        <span>Created {getTimeAgo(event.created_at)}</span>
        <div className="flex items-center gap-2">
          {event.last_used_at ? (
            <span className="text-emerald-600">Used {getTimeAgo(event.last_used_at)}</span>
          ) : (
            <span>Never used</span>
          )}
          {/* Analytics badge for pro users */}
          {isPro && analytics && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium text-xs">
              <TrendingUp size={12} />
              <span>{analytics.totalClicks}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {cardUI}

      {/* Output Modal - shared by both list and grid views */}
      <Modal isOpen={isOutputOpen} onClose={onOutputClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {event.title || 'Untitled Event'} - Output Options
          </ModalHeader>
          <ModalBody className="space-y-6">
            <Tabs
              aria-label="Output type"
              color="success"
              selectedKey={outputTab}
              onSelectionChange={(key) => setOutputTab(key as string)}
            >
              {/* HTML/CSS Tab */}
              <Tab key="htmlcss" title="HTML/CSS">
                <Card>
                  <CardBody className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Complete HTML Code</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        Email-safe individual buttons with click tracking. Copy and paste this code into your emails or website.
                      </p>
                    </div>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono">
                        {generatedCode}
                      </pre>
                      <Button
                        isIconOnly
                        className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            generatedCode,
                            'htmlcss'
                          )
                        }
                      >
                        {copiedCode === 'htmlcss' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Tab>

              {/* Embed Code Tab */}
              <Tab key="embed" title="Embed Code">
                <Card>
                  <CardBody className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">JavaScript Embed Code</h4>
                      <p className="text-sm text-slate-600 mb-3">
                        For the best experience, use the HTML/CSS tab above. The embed code is a lightweight alternative that loads the button asynchronously.
                      </p>
                    </div>
                    <div className="relative">
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono whitespace-pre-wrap break-all">
                        {generatedCode}
                      </pre>
                      <Button
                        isIconOnly
                        className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            generatedCode,
                            'embed'
                          )
                        }
                      >
                        {copiedCode === 'embed' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Tab>

              {/* Analytics Tab */}
              <Tab key="analytics" title="Analytics">
                <Card>
                  <CardBody className="space-y-4">
                    {isPro ? (
                      <>
                        {/* Pro user analytics */}
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                            <BarChart3 size={18} />
                            Event Performance
                          </h4>
                          <p className="text-sm text-slate-600 mb-4">
                            Track how your event is performing across different calendar platforms.
                          </p>
                        </div>

                        {analyticsLoading ? (
                          <div className="text-center py-8 text-slate-500">
                            Loading analytics...
                          </div>
                        ) : analytics && analytics.totalClicks > 0 ? (
                          <>
                            {/* Total clicks */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <div className="text-sm text-emerald-700 font-medium mb-1">Total Clicks</div>
                              <div className="text-3xl font-bold text-emerald-900">{analytics.totalClicks}</div>
                              {analytics.lastClickedAt && (
                                <div className="text-xs text-emerald-600 mt-1">
                                  Last clicked {getTimeAgo(analytics.lastClickedAt)}
                                </div>
                              )}
                            </div>

                            {/* Platform breakdown */}
                            {analytics.platformBreakdown.length > 0 && (
                              <div>
                                <h5 className="font-medium text-slate-900 mb-3">Clicks by Platform</h5>
                                <div className="space-y-2">
                                  {analytics.platformBreakdown.map((item) => {
                                    const percentage = (item.clicks / analytics.totalClicks) * 100;
                                    const platformNames: Record<string, string> = {
                                      google: 'Google Calendar',
                                      apple: 'Apple Calendar',
                                      outlook: 'Outlook',
                                      office365: 'Office 365',
                                      outlookcom: 'Outlook.com',
                                      yahoo: 'Yahoo Calendar',
                                    };

                                    return (
                                      <div key={item.platform} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className="text-slate-700 font-medium">
                                            {platformNames[item.platform] || item.platform}
                                          </span>
                                          <span className="text-slate-600">
                                            {item.clicks} ({percentage.toFixed(1)}%)
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                          <div
                                            className="bg-emerald-500 h-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Event page link */}
                            {event.share_id && (
                              <div className="pt-4 border-t border-slate-200">
                                <div className="text-sm text-slate-600 mb-2">Event Landing Page</div>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 px-3 py-2 bg-slate-100 rounded-md text-xs font-mono text-slate-700">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/e/{event.share_id}
                                  </code>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${event.share_id}`;
                                      navigator.clipboard.writeText(url);
                                      toast.success('Link copied!');
                                    }}
                                  >
                                    <Copy size={14} />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No clicks yet</p>
                            <p className="text-sm mt-1">Share your event to start tracking analytics</p>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Free user upgrade prompt */
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center mb-4">
                          <BarChart3 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-2">Unlock Analytics</h4>
                        <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
                          Track click performance across platforms, see which calendars your audience prefers, and optimize your event strategy.
                        </p>
                        <div className="space-y-2 text-sm text-left max-w-xs mx-auto mb-4">
                          <div className="flex items-start gap-2">
                            <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600">Real-time click tracking</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600">Platform breakdown analytics</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600">Event performance insights</span>
                          </div>
                        </div>
                        <Link href="/pricing">
                          <Button color="success" variant="shadow">
                            Upgrade to Pro
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Tab>

              {/* Event Page Tab - Coming Soon */}
              <Tab key="page" title="Event Page" isDisabled>
                <Card>
                  <CardBody className="space-y-4 text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Event Page - Coming Soon</h4>
                      <p className="text-sm text-slate-600">
                        Create a beautiful public event page with RSVP tracking and social sharing. Coming soon!
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}