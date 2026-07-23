package com.farmconnect.service.impl;

import com.farmconnect.domain.entity.Buyer;
import com.farmconnect.domain.entity.Farmer;
import com.farmconnect.domain.entity.Order;
import com.farmconnect.domain.entity.Review;
import com.farmconnect.domain.enums.NotificationType;
import com.farmconnect.domain.enums.OrderStatus;
import com.farmconnect.dto.request.ReviewCreateRequest;
import com.farmconnect.dto.response.PageResponse;
import com.farmconnect.dto.response.ReviewResponse;
import com.farmconnect.exception.BadRequestException;
import com.farmconnect.exception.ResourceNotFoundException;
import com.farmconnect.repository.BuyerRepository;
import com.farmconnect.repository.FarmerRepository;
import com.farmconnect.repository.OrderRepository;
import com.farmconnect.repository.ReviewRepository;
import com.farmconnect.service.NotificationService;
import com.farmconnect.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BuyerRepository buyerRepository;
    private final FarmerRepository farmerRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public ReviewResponse create(UUID buyerUserId, ReviewCreateRequest request) {
        Buyer buyer = buyerRepository.findByUserId(buyerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found for current user"));

        Order order = orderRepository.findByIdAndBuyerId(request.orderId(), buyer.getId())
                .orElseThrow(() -> ResourceNotFoundException.of("Order", request.orderId()));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("You can only review orders that have been delivered");
        }
        if (reviewRepository.existsByOrderId(order.getId())) {
            throw new BadRequestException("This order has already been reviewed");
        }

        Review review = Review.builder()
                .order(order)
                .buyer(buyer)
                .farmer(order.getFarmer())
                .rating(request.rating().shortValue())
                .comment(request.comment())
                .build();
        review = reviewRepository.save(review);

        notificationService.notify(order.getFarmer().getUser(), "New review received",
                buyer.getBusinessName() + " left a " + request.rating() + "-star review for order " + order.getOrderNumber() + ".",
                NotificationType.SYSTEM, "ORDER", order.getId());

        return toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listForFarmer(UUID farmerUserId, Pageable pageable) {
        Farmer farmer = farmerRepository.findByUserId(farmerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found for current user"));
        return PageResponse.of(reviewRepository.findByFarmerId(farmer.getId(), pageable).map(this::toResponse));
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getOrder().getId(),
                review.getOrder().getOrderNumber(),
                review.getBuyer().getBusinessName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
