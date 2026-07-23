package com.farmconnect.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "farmers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "farm_name", nullable = false, length = 150)
    private String farmName;

    @Column(name = "farm_address", length = 255)
    private String farmAddress;

    @Column(name = "farm_city", length = 100)
    private String farmCity;

    @Column(name = "farm_state", length = 100)
    private String farmState;

    @Column(name = "farm_pincode", length = 12)
    private String farmPincode;

    @Column(name = "farm_size_acres", precision = 8, scale = 2)
    private BigDecimal farmSizeAcres;

    @Column(name = "farming_experience_years")
    private Integer farmingExperienceYears;

    @Column(name = "primary_crop_types", length = 500)
    private String primaryCropTypes;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "farm_latitude", precision = 9, scale = 6)
    private BigDecimal farmLatitude;

    @Column(name = "farm_longitude", precision = 9, scale = 6)
    private BigDecimal farmLongitude;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
