# User Stories
The goal of this section is to explain how to use the application to evaluate the various user stories. 

#### Important 
	- You will need to refresh the page manually after a transaction has confirmed to see the updated state (ex: if creating a new storefront, wait for the transaction to confirm, refresh the page, and the created storefront will be displayed)
	- Most transactions (ex: creating a storefront, withdrawing a balance, etc.) may require more gas than the default provided by MetaMask. Set the gas to `100000` or more when sending a transaction. 

# List Of Stories  
## Admin Online Marketplace Management 
### Story 1
An administrator/Owner opens the application. The application should read the address and identify that the user is an admin/owner and show them only the admin related functionality like add & remove store owners as well as other admins to create a admin grp.

### How to test it
The account that deploys the contract will by default be an `admin` or `owner`. After deploying the contract, simply log into the application by selecting first account on MetaMask associated with your passphrase and admin only functionality will be shown. 

### Note
To add more admins, simply visit the home page as an `admin` and enter a desired `admin`'s address in the `Add Admin` form. After the transaction is confirmed, that account will be added in `admin` group.

### Story 2
An admin should add an address to the list of approved store owners, so if the owner of that address logs into the app, they have access to the store owner functions.

### How to test it
To test this story, first you will need to visit the application (`http://localhost:3000/`) with a **non** `admin` account, and click the `Request to be a store owner` button in the top of the page. 

Once the transaction is confirmed, login to application via `admin` account and visit the homepage again. Under the `Requested Store Owners` header, you should see the address of the store owner account that has sent the request. To make the address a `storeowner`, click the `Approve` button and submit the transaction. 

Once that transaction is confirmed, switch back to the store owner account from which request was created, and it should now display store owner functions. 

## Store Owner Functionality 
### Story 1
An approved store owner should be able to log into the application. The application should recognize their address and identify them as a store owner. They should be shown the store owner functionality. 

### How to test it
See `Story 2` in `Online Admin Marketplace Management` above to make an account as `storeowner`. After this, the homepage (`http://localhost:3000/`) should display store owner functionality. 

### Story 2
Store Owners can create a new storefront that will be displayed on the marketplace. They can also see the storefronts that they have already created. They can click on a storefront to manage it. 

### How to test it 
Select `store owner` account from Metamask. Login to application with a `storeowner` account, on the homepage, you will see a `Create a storefront` section. Enter the name for a new store front, and click `Create`, it will be create the new StoreFront . Once the transaction is confirmed, refresh the page to see the new store front, along with the `Store Id` and the `balance` under `Your Storefronts` section. To manage the store front, simply click its name (`http://localhost:3000/id={storefrontId}`) and it will take you to Store Front page to add/remove products.

### Story 3
Store Owner can add/remove store fronts and add/remove products to the store fronts. Also they can change the products price. 
### How to test it

#### Adding a Product
As a `storeowner`, click on any created storefront from the homepage. On the storefront page, (`http://localhost:3000/id={storefrontId}`), fill in the information in the `Add a Product` section, and click the button. After the transaction is confirmed, refresh the page and the product should appear in the `Products For Sale` section.  

#### Change A Product's Price 
As a `storeowner`, click on any created storefront from the homepage. On the storefront page, (`http://localhost:3000/id={storefrontId}`), Once product is added, in the `Products For Sale` section, you will be able to change a product's price by updating the value and submitting the `Update Product Price` form.

#### Removing a Product
As a `storeowner`, click on any created storefront from the homepage. On the storefront page, (`http://localhost:3000/id={storefrontId}`), after having added a product, in the `Products For Sale` section, you will be able to remove a product by clicking on the `Remove` button. Once the transaction is confirmed, refresh the page to see that the product is not displayed anymore. 

#### Removing a Store
As a `storeowner`, click on any created storefront from the homepage. On the storefront page, (`http://localhost:3000/id={storefrontId}`), There is an option to delete the store. Once the store Id is entered and `delete` is clicked, the store would be deleted and the balance would be transfered to the `storte owner`.

### Story 4
Store Owner can withdraw funds that the store has collected from sales.

### How to test it
As a `storeowner`, visit the homepage (`http://localhost:3000/`). Each store front would be having its balance alongside with name and Id. A `storeowner` can use the `Withdraw balance` button to withdraw the total balance of a storefront. After the transaction is confirmed, the balance for that store front will get 0, and the `storeowner`'s account balance will have been incremented by the total balance of the store.

## Buyer Functionality 

### Story 1
All the stores created by `Store Owners` are displayed on a central marketplace where buyers can purchase goods posted by the store owners.

### How to test it
Login to the application (`http://localhost:3000/`) with an account that is neither an `admin` or `storeowner` and you will see a list of all storefronts created by the `store owners`.

### Story 2
A buyer logs into the application. The application does not recognize their address and should be shown the generic buyer's functionality. On the landing page, buyers should browse all the storefronts that are created by `store owners` in the marketplace. If buyer clicks on a storefront it will take them to a products page. 

### How to test it
Login to the application with with an account that is neither an `admin` or `storeowner` and visit the homepage (`http://localhost:3000/`). You can see all the store fronts created by store owners with link to them. 

### Story 3
Buyers should be able to see a list of products offered by the store, including their price and quantity. Buyers should be able to purchase a product, which will debit their account and send it to the store. The quantity of the item in the store’s inventory will be reduced by the appropriate amount.

### How to test it
Login to the application with with an account that is neither an `admin` or `storeowner` and visit the homepage (`http://localhost:3000/`). You can see all the store fronts created by store owners with link to them. Click on one of the stores to see the products. To purchase a product, simply select the desired quantity and click `Buy`. A transaction will be created with the amount being the price of the product multiplied by the quantity. Once the transaction is confirmed, the value will be sent to the contract, and the quantity for the product will be updated once you refresh the page.
