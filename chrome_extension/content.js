document.addEventListener('DOMContentLoaded', () => {
    const purchaseInfo = extractPurchaseInfo();
    if (purchaseInfo) {
      chrome.runtime.sendMessage({ type: 'purchaseInfo', data: purchaseInfo });
    }
  });
  
  function extractPurchaseInfo() {
    // This function should be customized to extract relevant information from the DOM.
    // Example for a booking confirmation page:
    const dateElement = document.querySelector('.booking-date');
    const amountElement = document.querySelector('.booking-amount');
    if (dateElement && amountElement) {
      return {
        date: dateElement.textContent,
        amount: amountElement.textContent
      };
    }
    return null;
  }