package com.farmconnect.payment;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * Wraps the Razorpay Java SDK. Fully inert (every method is a safe no-op) when
 * RAZORPAY_KEY_ID/SECRET aren't set - same "wired up and inert" pattern as Google
 * OAuth2 / Cloudinary / SMTP / Maps elsewhere in this app. COD checkout works
 * identically whether or not this is configured.
 */
@Slf4j
@Component
public class RazorpayPaymentService {

    private final String keyId;
    private final String keySecret;
    private final boolean configured;

    public RazorpayPaymentService(
            @Value("${app.razorpay.key-id}") String keyId,
            @Value("${app.razorpay.key-secret}") String keySecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.configured = StringUtils.hasText(keyId) && StringUtils.hasText(keySecret);
    }

    public boolean isConfigured() {
        return configured;
    }

    /** Safe to expose to the frontend - it's the public key Checkout.js needs, not the secret. */
    public String getPublicKeyId() {
        return keyId;
    }

    public record RazorpayOrder(String id) {
    }

    public Optional<RazorpayOrder> createOrder(String receipt, BigDecimal amountInRupees) {
        if (!configured) {
            return Optional.empty();
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject request = new JSONObject();
            // Razorpay amounts are in the smallest currency unit - paise, not rupees.
            request.put("amount", amountInRupees.multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP).longValueExact());
            request.put("currency", "INR");
            request.put("receipt", receipt);
            com.razorpay.Order order = client.orders.create(request);
            return Optional.of(new RazorpayOrder(order.get("id")));
        } catch (Exception ex) {
            log.error("Failed to create Razorpay order for receipt {}", receipt, ex);
            return Optional.empty();
        }
    }

    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (!configured) {
            return false;
        }
        try {
            JSONObject payload = new JSONObject();
            payload.put("razorpay_order_id", razorpayOrderId);
            payload.put("razorpay_payment_id", razorpayPaymentId);
            payload.put("razorpay_signature", razorpaySignature);
            return Utils.verifyPaymentSignature(payload, keySecret);
        } catch (Exception ex) {
            log.error("Razorpay signature verification threw an exception", ex);
            return false;
        }
    }
}
