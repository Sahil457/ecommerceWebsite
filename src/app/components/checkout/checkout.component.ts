import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup ,FormControl} from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit{

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;


  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  //event!: Event;

  constructor(private formBuilder: FormBuilder,private luv2ShopFormService:Luv2ShopFormService) {
    

   }

  ngOnInit(): void {
    
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })

    });
    //populate credit card months
    const startMonth: number = new Date().getMonth()+1;
    console.log("startMonth" + startMonth);

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months " + JSON.stringify(data));
        this.creditCardMonths = data;
      }

    );

    //populate credit card year
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrived credit card years" + JSON.stringify(data));
        this.creditCardYears = data;
      }

    );
    //populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries" + JSON.stringify(data));
        this.countries = data;
       }
    );
  }

  copyShippingAddressToBillingAddress(event:any) {
    //console.log('ok');

    if (event.target.checked) {
      const shippingAddressValue = this.checkoutFormGroup.controls["shippingAddress"].value;
      const billingAddressControl = this.checkoutFormGroup.get("billingAddress") as FormControl;
      billingAddressControl.setValue(shippingAddressValue);

      //bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls["billingAddress"].reset();
      //reset fix  for states- comment 
      this.billingAddressStates = [];
    }
  }


  onSubmit() {
    console.log("handking the submit button");
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("the email address" + this.checkoutFormGroup.get('customer')?.value.email);

    console.log("shipping address country is" + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("shipping Address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth()+1;
    }
    else {
      startMonth = 1;
    }
    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months" + JSON.stringify(data));
        this.creditCardMonths = data;
       }
    );
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName } country code: ${countryCode} `);
    console.log(`${formGroupName } country name: ${countryName} `);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;

        }
        else {
          this.billingAddressStates = data;
        }
        //select first item by Default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}
