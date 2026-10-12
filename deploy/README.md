# Deploy only the legal pages to Netlify (subdomain nexus-legal.netlify.app)
# Usage: npx netlify-cli deploy --dir=. --functions=none --site=nexus-legal
# But we need separate deploys for privacy and terms.
# This script deploys privacy.html as a single-page site.
# See deploy-privacy.sh and deploy-terms.sh