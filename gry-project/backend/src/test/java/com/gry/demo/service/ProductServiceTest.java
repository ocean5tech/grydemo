package com.gry.demo.service;

import com.gry.demo.dto.ProductDto;
import com.gry.demo.entity.Product;
import com.gry.demo.exception.BusinessException;
import com.gry.demo.exception.ResourceNotFoundException;
import com.gry.demo.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private ProductDto testProductDto;

    @BeforeEach
    void setUp() {
        testProduct = new Product("Test Product", "Test Description", new BigDecimal("99.99"), 10);
        testProduct.setId(1L);
        
        testProductDto = new ProductDto("Test Product", "Test Description", new BigDecimal("99.99"), 10);
    }

    @Test
    void createProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product result = productService.createProduct(testProductDto);

        assertNotNull(result);
        assertEquals(testProduct.getName(), result.getName());
        assertEquals(testProduct.getPrice(), result.getPrice());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void getProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        Product result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals(testProduct.getId(), result.getId());
        assertEquals(testProduct.getName(), result.getName());
    }

    @Test
    void getProductById_NotFound_ThrowsException() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, 
            () -> productService.getProductById(1L));
        
        assertTrue(exception.getMessage().contains("Product not found"));
    }

    @Test
    void getAllProducts_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(testProduct));
        when(productRepository.findAll(pageable)).thenReturn(productPage);

        Page<Product> result = productService.getAllProducts(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testProduct.getName(), result.getContent().get(0).getName());
    }

    @Test
    void updateProduct_Success() {
        ProductDto updateDto = new ProductDto("Updated Product", "Updated Description", new BigDecimal("199.99"), 20);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product result = productService.updateProduct(1L, updateDto);

        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void deleteProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        assertDoesNotThrow(() -> productService.deleteProduct(1L));
        
        verify(productRepository).delete(testProduct);
    }

    @Test
    void updateStock_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product result = productService.updateStock(1L, 5);

        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateStock_InsufficientStock_ThrowsException() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        BusinessException exception = assertThrows(BusinessException.class, 
            () -> productService.updateStock(1L, 15));
        
        assertEquals("INSUFFICIENT_STOCK", exception.getCode());
        assertTrue(exception.getMessage().contains("库存不足"));
    }

    @Test
    void restoreStock_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product result = productService.restoreStock(1L, 5);

        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void searchProducts_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(testProduct));
        when(productRepository.findProductsWithFilters(any(), any(), any(), any(), eq(pageable)))
            .thenReturn(productPage);

        Page<Product> result = productService.searchProducts("Test", new BigDecimal("50"), new BigDecimal("150"), true, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository).findProductsWithFilters(any(), any(), any(), any(), eq(pageable));
    }

    @Test
    void getAvailableProducts_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> productPage = new PageImpl<>(Arrays.asList(testProduct));
        when(productRepository.findAvailableProducts(pageable)).thenReturn(productPage);

        Page<Product> result = productService.getAvailableProducts(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository).findAvailableProducts(pageable);
    }
}