package com.gry.demo.controller;

import com.gry.demo.dto.ApiResponse;
import com.gry.demo.dto.ProductDto;
import com.gry.demo.entity.Product;
import com.gry.demo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("获取产品信息成功", product));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody ProductDto productDto) {
        Product createdProduct = productService.createProduct(productDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("产品创建成功", createdProduct));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Long id, 
                                                             @Valid @RequestBody ProductDto productDto) {
        Product updatedProduct = productService.updateProduct(id, productDto);
        return ResponseEntity.ok(ApiResponse.success("产品更新成功", updatedProduct));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("产品删除成功", null));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products;
        
        if (name != null || minPrice != null || maxPrice != null || inStock != null) {
            products = productService.searchProducts(name, minPrice, maxPrice, inStock, pageable);
        } else {
            products = productService.getAllProducts(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("获取产品列表成功", products));
    }
    
    @GetMapping("/available")
    public ResponseEntity<ApiResponse<Page<Product>>> getAvailableProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getAvailableProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success("获取可用产品列表成功", products));
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<Product>> updateStock(@PathVariable Long id, 
                                                           @RequestParam Integer quantity) {
        Product product = productService.updateStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("库存更新成功", product));
    }
}