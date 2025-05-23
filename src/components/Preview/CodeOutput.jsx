// src/components/Preview/CodeOutput.jsx
import { useState } from 'react'
import { CopyIcon, CheckIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CodeOutput({ code }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast.error('Failed to copy code')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="section-title">Generated HTML Code</h3>
        <button
          onClick={copyToClipboard}
          className="btn-secondary flex items-center space-x-2"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {code || '<!-- Code will appear here when you fill out the form -->'}
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Implementation Instructions</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Copy the HTML code above</li>
          <li>Paste it into your website, email template, or landing page</li>
          <li>The button will automatically work with all selected calendar platforms</li>
          <li>No additional setup or JavaScript libraries required</li>
        </ol>
      </div>
    </div>
  )
}