package com.example.food_delivery.config.initialization;

import com.example.food_delivery.dto.domain.OrderDto;
import com.example.food_delivery.model.domain.*;
import com.example.food_delivery.model.enums.OrderStatus;
import com.example.food_delivery.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Profile({"!test"})
@Component
@DependsOn("dataInitializer")
public class OrderCartSeeder {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final ProductRepository productRepository;

    public OrderCartSeeder(OrderRepository orderRepository,
                           UserRepository userRepository,
                           RestaurantRepository restaurantRepository,
                           ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void seed() {
        if (orderRepository.count() > 0) return;
        User customer = userRepository.findByUsername("customer")
                .orElseThrow(() -> new IllegalStateException("Seed prerequisite missing: user 'customer'"));

        Restaurant restaurant = restaurantRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Seed prerequisite missing: at least one restaurant"));

        List<Product> products = productRepository.findAll();
        if (products.size() < 2) {
            throw new IllegalStateException("Seed prerequisite missing: not enough products for restaurant " + restaurant.getName());
        }

        createOrder(customer, restaurant, products.get(0), 2, products.get(1), 1,
                new Address("Partizanska 12", null, "Skopje", "MK", "1000"),
                OrderStatus.PENDING);

        createOrder(customer, restaurant, products.get(1), 3, products.get(2), 1,
                new Address("Ilindenska 55", "stan 7", "Skopje", "MK", "1000"),
                OrderStatus.PENDING);

        createOrder(customer, restaurant, products.get(0), 1, products.get(1), 2,
                new Address("Makedonija bb", null, "Skopje", "MK", "1000"),
                OrderStatus.PENDING);
    }

    private void createOrder(User customer,
                             Restaurant restaurant,
                             Product p1, int q1,
                             Product p2, int q2,
                             Address address,
                             OrderStatus status) {


        Order order = new Order();
        order.setUser(customer);
        order.setRestaurant(restaurant);
        order.setStatus(status);
        order.setPlacedAt(Instant.now());
        order.setDeliveryAddress(address);

        OrderItem i1 = new OrderItem();
        i1.setOrder(order);
        i1.setProduct(p1);
        i1.setQuantity(q1);
        i1.setUnitPriceSnapshot(p1.getPrice());

        OrderItem i2 = new OrderItem();
        i2.setOrder(order);
        i2.setProduct(p2);
        i2.setQuantity(q2);
        i2.setUnitPriceSnapshot(p2.getPrice());

        order.setItems(List.of(i1, i2));
        order.setTotal(p1.getPrice() * q1 + p2.getPrice() * q2);



        orderRepository.save(order);
    }
}