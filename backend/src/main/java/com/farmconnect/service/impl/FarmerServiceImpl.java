package com.farmconnect.service.impl;

import com.farmconnect.client.GeocodingClient;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.dto.request.FarmerProfileUpdateRequest;
import com.farmconnect.dto.response.FarmerProfileResponse;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.service.FarmerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class FarmerServiceImpl implements FarmerService {

    private final FarmerRepository farmerRepository;
    private final GeocodingClient geocodingClient;

    @Override
    @Transactional(readOnly = true)
    public FarmerProfileResponse getProfile(UUID userId) {
        return toResponse(findByUserId(userId));
    }

    @Override
    @Transactional
    public FarmerProfileResponse updateProfile(UUID userId, FarmerProfileUpdateRequest request) {
        Farmer farmer = findByUserId(userId);

        if (StringUtils.hasText(request.fullName())) {
            farmer.getUser().setFullName(request.fullName());
        }
        if (StringUtils.hasText(request.phone())) {
            farmer.getUser().setPhone(request.phone());
        }
        if (StringUtils.hasText(request.farmName())) {
            farmer.setFarmName(request.farmName());
        }
        farmer.setFarmAddress(request.farmAddress());
        farmer.setFarmCity(request.farmCity());
        farmer.setFarmState(request.farmState());
        farmer.setFarmPincode(request.farmPincode());
        farmer.setFarmSizeAcres(request.farmSizeAcres());
        farmer.setFarmingExperienceYears(request.farmingExperienceYears());
        farmer.setPrimaryCropTypes(request.primaryCropTypes());
        farmer.setBio(request.bio());

        Optional<GeocodingClient.Coordinates> geocoded = geocodingClient.geocode(
                buildAddress(farmer.getFarmAddress(), farmer.getFarmCity(), farmer.getFarmState(), farmer.getFarmPincode()));
        if (geocoded.isPresent()) {
            farmer.setFarmLatitude(geocoded.get().latitude());
            farmer.setFarmLongitude(geocoded.get().longitude());
        } else {
            farmer.setFarmLatitude(request.farmLatitude());
            farmer.setFarmLongitude(request.farmLongitude());
        }

        return toResponse(farmerRepository.save(farmer));
    }

    private String buildAddress(String... parts) {
        return Stream.of(parts)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(", "));
    }

    private Farmer findByUserId(UUID userId) {
        return farmerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for current user"));
    }

    private FarmerProfileResponse toResponse(Farmer farmer) {
        return new FarmerProfileResponse(
                farmer.getId(),
                farmer.getUser().getFullName(),
                farmer.getUser().getEmail(),
                farmer.getUser().getPhone(),
                farmer.getUser().getProfileImageUrl(),
                farmer.getFarmName(),
                farmer.getFarmAddress(),
                farmer.getFarmCity(),
                farmer.getFarmState(),
                farmer.getFarmPincode(),
                farmer.getFarmSizeAcres(),
                farmer.getFarmingExperienceYears(),
                farmer.getPrimaryCropTypes(),
                farmer.getBio(),
                farmer.getFarmLatitude(),
                farmer.getFarmLongitude(),
                farmer.isVerified(),
                farmer.getCreatedAt()
        );
    }
}
