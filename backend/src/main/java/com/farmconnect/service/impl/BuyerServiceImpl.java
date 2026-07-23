package com.farmconnect.service.impl;

import com.farmconnect.client.GeocodingClient;
import com.farmconnect.domain.entity.Buyer;
import com.farmconnect.dto.request.BuyerProfileUpdateRequest;
import com.farmconnect.dto.response.BuyerProfileResponse;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.BuyerRepository;
import com.farmconnect.service.BuyerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class BuyerServiceImpl implements BuyerService {

    private final BuyerRepository buyerRepository;
    private final GeocodingClient geocodingClient;

    @Override
    @Transactional(readOnly = true)
    public BuyerProfileResponse getProfile(UUID userId) {
        return toResponse(findByUserId(userId));
    }

    @Override
    @Transactional
    public BuyerProfileResponse updateProfile(UUID userId, BuyerProfileUpdateRequest request) {
        Buyer buyer = findByUserId(userId);

        if (StringUtils.hasText(request.fullName())) {
            buyer.getUser().setFullName(request.fullName());
        }
        if (StringUtils.hasText(request.phone())) {
            buyer.getUser().setPhone(request.phone());
        }
        if (StringUtils.hasText(request.businessName())) {
            buyer.setBusinessName(request.businessName());
        }
        buyer.setDeliveryAddress(request.deliveryAddress());
        buyer.setCity(request.city());
        buyer.setState(request.state());
        buyer.setPincode(request.pincode());
        buyer.setGstNumber(request.gstNumber());

        if (request.latitude() != null && request.longitude() != null) {
            // Client sent explicit coordinates (e.g. "Detect my location") - trust them
            // over a re-derived address-text geocode, which would silently overwrite a
            // precise GPS fix with a coarser approximation.
            buyer.setLatitude(request.latitude());
            buyer.setLongitude(request.longitude());
        } else {
            geocodingClient.geocode(
                    buildAddress(buyer.getDeliveryAddress(), buyer.getCity(), buyer.getState(), buyer.getPincode()))
                    .ifPresent(coordinates -> {
                        buyer.setLatitude(coordinates.latitude());
                        buyer.setLongitude(coordinates.longitude());
                    });
        }

        return toResponse(buyerRepository.save(buyer));
    }

    private String buildAddress(String... parts) {
        return Stream.of(parts)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(", "));
    }

    private Buyer findByUserId(UUID userId) {
        return buyerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for current user"));
    }

    private BuyerProfileResponse toResponse(Buyer buyer) {
        return new BuyerProfileResponse(
                buyer.getId(),
                buyer.getUser().getFullName(),
                buyer.getUser().getEmail(),
                buyer.getUser().getPhone(),
                buyer.getUser().getProfileImageUrl(),
                buyer.getBuyerType().name(),
                buyer.getBusinessName(),
                buyer.getDeliveryAddress(),
                buyer.getCity(),
                buyer.getState(),
                buyer.getPincode(),
                buyer.getLatitude(),
                buyer.getLongitude(),
                buyer.getGstNumber(),
                buyer.getCreatedAt()
        );
    }
}
