// src/utils/navOrder.js
export const NAV_ORDER = [
  "/companyinfo",           // 1. Company Info
  "/companybackground",     // 2. Company Background
  "/organisationalchart",   // 3. Organisational Chart
  "/halalpolicy",           // 4. Halal Policy
  "/productlist",           // 5. Product List
  "/rawmaterialmaster",     // 6. Raw Material Master
  "/rawmaterialsummary",    // 7. Raw Material Summary
  "/productflowchartraw",   // 8. Product Flow Chart Raw
  "/productflowprocess",    // 9. Product Flow Process
  "/premiseplan",           // 10. Premise Plan
  "/traceability",          // 11. Traceability
];

export function getNextPath(currentPath) {
  const i = NAV_ORDER.indexOf(currentPath);
  if (i === -1) return "/"; // fallback to home if path not found
  const next = NAV_ORDER[i + 1];
  return next || NAV_ORDER[i]; // if last page, stay on last
}

export function getPrevPath(currentPath) {
  const i = NAV_ORDER.indexOf(currentPath);
  if (i <= 0) return NAV_ORDER[0]; // if first page, stay on first
  return NAV_ORDER[i - 1];
}
