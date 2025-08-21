package com.gry.demo.service;

import com.gry.demo.dto.ProductDto;
import com.gry.demo.entity.Product;
import com.gry.demo.exception.BusinessException;
import com.gry.demo.exception.ResourceNotFoundException;
import com.gry.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public Product createProduct(ProductDto productDto) {
        Product product = new Product(
            productDto.getName(),
            productDto.getDescription(),
            productDto.getPrice(),
            productDto.getStockQuantity()
        );
        return productRepository.save(product);
    }
    
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }
    
    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String name, BigDecimal minPrice, BigDecimal maxPrice, 
                                       Boolean inStock, Pageable pageable) {
        return productRepository.findProductsWithFilters(name, minPrice, maxPrice, inStock, pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<Product> getAvailableProducts(Pageable pageable) {
        return productRepository.findAvailableProducts(pageable);
    }
    
    public Product updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = getProductById(id);
        
        existingProduct.setName(productDto.getName());
        existingProduct.setDescription(productDto.getDescription());
        existingProduct.setPrice(productDto.getPrice());
        existingProduct.setStockQuantity(productDto.getStockQuantity());
        
        return productRepository.save(existingProduct);
    }
    
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
    
    public Product updateStock(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        
        if (product.getStockQuantity() < quantity) {
            throw new BusinessException("INSUFFICIENT_STOCK", 
                String.format("库存不足，当前库存: %d, 需要: %d", product.getStockQuantity(), quantity));
        }
        
        product.setStockQuantity(product.getStockQuantity() - quantity);
        return productRepository.save(product);
    }
    
    public Product restoreStock(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        product.setStockQuantity(product.getStockQuantity() + quantity);
        return productRepository.save(product);
    }
}