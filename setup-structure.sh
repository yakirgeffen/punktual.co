#!/bin/bash

echo "🚀 Setting up Punktual folder structure..."

# Create main directories
mkdir -p src/components/Layout
mkdir -p src/components/EventCreator
mkdir -p src/components/FormSections
mkdir -p src/components/RecentEvents
mkdir -p src/components/Preview
mkdir -p src/components/UI
mkdir -p src/components/Auth
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/utils
mkdir -p src/pages/api/events
mkdir -p src/pages/api/auth

# Create component files
touch src/components/Layout/Layout.jsx
touch src/components/Layout/Navbar.jsx
touch src/components/Layout/Footer.jsx

touch src/components/EventCreator/EventCreator.jsx
touch src/components/EventCreator/EventForm.jsx
touch src/components/EventCreator/LivePreview.jsx
touch src/components/EventCreator/MobileToggle.jsx

touch src/components/FormSections/BasicDetails.jsx
touch src/components/FormSections/EventDetails.jsx
touch src/components/FormSections/AdvancedOptions.jsx
touch src/components/FormSections/ButtonCustomization.jsx

touch src/components/RecentEvents/RecentEvents.jsx
touch src/components/RecentEvents/EventCard.jsx
touch src/components/RecentEvents/AuthPrompt.jsx

touch src/components/Preview/ButtonPreview.jsx
touch src/components/Preview/CodeOutput.jsx

touch src/components/UI/CollapsibleSection.jsx
touch src/components/UI/PlatformSelector.jsx
touch src/components/UI/ValidationError.jsx
touch src/components/UI/ConfirmDialog.jsx

touch src/components/Auth/LoginModal.jsx

# Create context files
touch src/contexts/EventContext.jsx

# Create hook files
touch src/hooks/useAuth.js
touch src/hooks/useRecentEvents.js

# Create lib files
touch src/lib/calendarGenerator.js
touch src/lib/storage.js

# Create API files
touch src/pages/api/events/create.js
touch src/pages/api/auth/callback.js

# Create utils
touch src/utils/helpers.js

echo "✅ Folder structure created successfully!"
echo "📁 Created $(find src -type f | wc -l) files"
echo "📂 Created $(find src -type d | wc -l) directories"
