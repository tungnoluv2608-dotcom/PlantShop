const TRACKING_PROVIDER_CONFIG = {
  ghn: {
    label: "GHN",
    buildUrl: (trackingNumber) => `https://donhang.ghn.vn/?order_code=${encodeURIComponent(trackingNumber)}`,
  },
  ghtk: {
    label: "GHTK",
    buildUrl: (trackingNumber) => `https://i.ghtk.vn/${encodeURIComponent(trackingNumber)}`,
  },
  viettelpost: {
    label: "Viettel Post",
    buildUrl: (trackingNumber) => `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/?billcode=${encodeURIComponent(trackingNumber)}`,
  },
  other: {
    label: "Khac",
    buildUrl: () => "",
  },
};

function normalizeTrackingProvider(provider) {
  const normalized = String(provider || "").trim().toLowerCase();
  if (!normalized) return null;
  return TRACKING_PROVIDER_CONFIG[normalized] ? normalized : "other";
}

function buildTrackingUrl(provider, trackingNumber, explicitUrl) {
  const normalizedProvider = normalizeTrackingProvider(provider);
  const normalizedTrackingNumber = String(trackingNumber || "").trim();
  const normalizedExplicitUrl = String(explicitUrl || "").trim();

  if (normalizedExplicitUrl) return normalizedExplicitUrl;
  if (!normalizedProvider || !normalizedTrackingNumber) return null;

  const config = TRACKING_PROVIDER_CONFIG[normalizedProvider];
  const builtUrl = config?.buildUrl?.(normalizedTrackingNumber) || "";
  return builtUrl || null;
}

module.exports = {
  TRACKING_PROVIDER_CONFIG,
  normalizeTrackingProvider,
  buildTrackingUrl,
};
