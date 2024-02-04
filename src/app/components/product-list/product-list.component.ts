import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  previousCategoryId: number = 1;
  previousKeyword: string = "";
  //new property for pagination

  thePageNumber: number = 1;
  thePageSize = 5;
  theTotalElements = 0;
  

  constructor(private productService: ProductService,private cartService:CartService,
              private route: ActivatedRoute) {
    
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
    
  }
  listProducts()
  {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;
    
    //if we differnet keyword than previous
    //set thePageNumber to 1
    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }
    
    this.previousKeyword = theKeyword;
    console.log(`keyword=${theKeyword},thePageNumber=${this.thePageNumber}`);
    
    //now search for product using keyword
    this.productService.searchProductPaginate(this.thePageNumber - 1,
      this.thePageSize,
      theKeyword
    ).subscribe(this.processResult());


  }

  handleListProducts() {
    
    //check if "id " parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      //get id as string convert to number
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else {
      //not category id available
      this.currentCategoryId = 1;
    }

    //check if we have different category id than previous 
    //angular will reuse the component if it currently viewd
    

    //if we have diffent category id than previous set page back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }
    
    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId},thePageNumber=${this.thePageNumber}`);
     //now get product for  given category id
    
    this.productService.getProductListPaginate(this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId
    ).subscribe(this.processResult());


  }

  updatePageSize(pageSize: String)
  {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }
  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;

    };
  }
  addToCart(theProduct: Product) {
    console.log(`Adding to cart:${theProduct.name},${theProduct.unitPrice}`);
    //todo  do the real work
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
    

  }
}
