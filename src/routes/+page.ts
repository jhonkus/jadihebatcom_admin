// Enable CSR for interactive components
// Prevent server data serialization to keep it out of view-source
export const csr = true;
export const ssr = true;

// This prevents parent layout data from being serialized in page data
export const load = async () => {
	// Return only what's needed for this page
	// User data will be loaded client-side by navbar from cookies
	return {};
};
