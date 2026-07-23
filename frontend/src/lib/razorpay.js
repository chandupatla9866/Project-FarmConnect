const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loadPromise = null;
export function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Razorpay checkout script"));
    };
    document.body.appendChild(script);
  });
  return loadPromise;
}
export function openRazorpayCheckout(options) {
  if (!window.Razorpay) {
    throw new Error("Razorpay script not loaded yet");
  }
  new window.Razorpay(options).open();
}