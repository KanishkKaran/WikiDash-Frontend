import React from 'react';

const PrivacyPage = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-slate-700 mb-8">
            At WikiDash, we are committed to protecting your privacy and maintaining transparency about how we handle data. This policy explains what information we collect, how we use it, and your rights regarding your data.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">WikiDash collects information from public Wikipedia APIs to visualize and analyze Wikipedia article data. We do not collect any personal information from our users, apart from standard server logs which may include:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>IP addresses (for security and analytics purposes only)</li>
            <li>Browser type and version</li>
            <li>Operating system information</li>
            <li>Referrer URLs</li>
            <li>Timestamps of requests</li>
            <li>Search queries you enter into the WikiDash search bar</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">How We Use Your Information</h2>
          <p className="mb-4">The limited information we collect is used for:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Analyzing usage patterns to improve our service</li>
            <li>Ensuring proper functioning of the website</li>
            <li>Maintaining website security</li>
            <li>Generating anonymous, aggregated statistics</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Cookies and Similar Technologies</h2>
          <p className="mb-4">WikiDash uses only essential cookies that are necessary for the functioning of the website. We do not use any tracking or advertising cookies. The essential cookies we use:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Help maintain your session state while using WikiDash</li>
            <li>Do not track your activity across other websites</li>
            <li>Are automatically deleted when you close your browser</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Data Retention</h2>
          <p className="mb-6">
            Server logs are automatically deleted after 30 days. We do not maintain a persistent database of user search history or interactions.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Third-Party Services</h2>
          <p className="mb-6">
            WikiDash uses Wikipedia's public APIs to retrieve article data. All information displayed on WikiDash about Wikipedia articles is sourced from Wikipedia and is subject to their own terms of service and privacy policies. We do not share any user data with third parties.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Children's Privacy</h2>
          <p className="mb-6">
            WikiDash is an educational tool suitable for users of all ages. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Access any personal information we may hold about you</li>
            <li>Request correction of any inaccurate information</li>
            <li>Request deletion of your data (though as noted above, we collect very minimal user data)</li>
            <li>Object to our processing of your data</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Changes to This Privacy Policy</h2>
          <p className="mb-6">
            We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify users of any significant changes by posting a notice on our website.
          </p>
          
          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Contact Us</h2>
          <p className="mb-6">
            If you have any questions about this privacy policy or our data practices, please contact us at privacy@wiki-dash.com.
          </p>
          
          <div className="border-t border-slate-200 pt-6 mt-8">
            <p className="text-sm text-slate-500">
              Last updated: May 16, 2025
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;
