package com.example.food_delivery.repository;

import com.example.food_delivery.model.domain.Product;
import com.example.food_delivery.model.domain.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Override
    @Query("SELECT p FROM Product p ORDER BY p.id ASC")
    List<Product> findAll();

    List<Product> findByRestaurant(Restaurant restaurant);
}
