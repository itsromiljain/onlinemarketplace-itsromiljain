let catchRevert = require("./exceptionsHelpers.js").catchRevert
var OnlineMarket = artifacts.require("OnlineMarket");

contract("OnlineMarket", accounts => {

    const owner = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];
    const storeOwner1 = accounts[3];
    const storeOwner2 = accounts[4];
    const storeOwner3 = accounts[5];
    const buyer1 = accounts[6];
    const buyer2 = accounts[7];

    // Define beforeEach
    before(async() => {
        instance = await OnlineMarket.deployed();
    });

    it("Check Owner is Admin", async() => {
        const ownerEnrolled = await instance.checkAdmin(owner, {from:owner});
        assert.equal(ownerEnrolled, true, "Owner should be enrolled");

    });
    it("Add another Admin", async() => {
        await instance.addAdmin(admin1, {from:owner});
        const adminEnrolled = await instance.checkAdmin(admin1, {from:owner});
        assert.equal(adminEnrolled, true, "Another Admin should be added successfully");

    });

    it("Add second Admin by first Admin", async() => {
        await instance.addAdmin(admin2, {from:admin1});
        const admin2Enrolled = await instance.checkAdmin(admin2, {from:admin1});
        assert.equal(admin2Enrolled, true, "Second Admin should be added successfully by First Admin");

    });

    it("Admin can only be removed by owner otherwise revert", async() => {
        // Admin 1 is not owner
        await catchRevert(instance.removeAdmin(admin2, {from:admin1}));
    });

    it("Remove second Admin by Owner", async() => {
        await instance.removeAdmin(admin2, {from:owner});
        const admin2Enrolled = await instance.checkAdmin(admin2, {from:owner});
        assert.equal(admin2Enrolled, false, "Second Admin should not be enrolled as removed by Owner");

    });

    it("Admin should only be added by approved admins otherwise revert", async() => {
        //Admin2 is not in approved admin list
        await catchRevert(instance.addAdmin(admin2, {from:admin2}));
    });

    it("Add Store Owner Not approved by Admin", async() => {
        await instance.addStoreOwner({from:storeOwner1});
        const isStoreOwnerApproved = await instance.checkStoreOwnerStatus(storeOwner1, {from:storeOwner1});
        const requestedStoreOwnersLength = await instance.getRequestedStoreOwnersLength.call();
        assert.equal(isStoreOwnerApproved, false, "Store Owner should be added but not yet approved by Admin");
        assert.equal(requestedStoreOwnersLength, 1, "Only 1 Store Owner should be requested");
    });

    it("View Requested Store Owner", async() => {
        const storeOwnerAddress = await instance.viewRequestedStoreOwner(0, {from:admin1});
        assert.equal(storeOwnerAddress, storeOwner1, "Requested Store Owner should match")
    });

    it("Add Second Store Owner and view requested store owners", async() => {
        await instance.addStoreOwner({from:storeOwner2});
        const isStoreOwnerApproved = await instance.checkStoreOwnerStatus(storeOwner2, {from:storeOwner2});
        const storeOwners =  await instance.viewRequestedStoreOwners();
        //console.log(storeOwners);
        assert.equal(isStoreOwnerApproved, false, "Store Owner should be added but not yet approved by Admin");
        assert.equal(storeOwners[0], storeOwner1, "Store Owner 1 should be there in RequestedStoreOwnersList");
        assert.equal(storeOwners[1], storeOwner2, "Store Owner 2 should be there in RequestedStoreOwnersList");
        assert.equal(await instance.getRequestedStoreOwnersLength.call(), 2, "2 Store Owner should be requested");
    });


    it("Approve first Store Owner by Admin", async() => {
        await instance.approveStoreOwners(storeOwner1, {from:admin1});
        const isStoreOwnerApproved = await instance.checkStoreOwnerStatus(storeOwner1, {from:storeOwner1});
        assert.equal(isStoreOwnerApproved, true, "Store Owner should be approved by Admin");
        assert.equal(await instance.getApprovedStoreOwnersLength.call(), 1, "1 store owner should be in approved list");
        assert.equal(await instance.getRequestedStoreOwnersLength.call(), 1, "1 store owner should be in requested list");
    });

    it("Approve second Store Owner by Admin", async() => {
        await instance.approveStoreOwners(storeOwner2, {from:admin1});
        const isStoreOwnerApproved = await instance.checkStoreOwnerStatus(storeOwner2, {from:storeOwner2});
        //console.log(isStoreOwnerApproved, await instance.getApprovedStoreOwnersLength.call(), await instance.getRequestedStoreOwnersLength.call());
        assert.equal(isStoreOwnerApproved, true, "Store Owner should be added but not yet approved by Admin");
        assert.equal(await instance.getApprovedStoreOwnersLength.call(), 2, "2 store owners should be in approved list");
        assert.equal(await instance.getRequestedStoreOwnersLength.call(), 0, "0 store owner should be in requested list");
    });

    it("Remove second Store Owner by Admin", async() => {
        await instance.removeStoreOwner(storeOwner2, {from:admin1});
        const isStoreOwnerApproved = await instance.checkStoreOwnerStatus(storeOwner2, {from:storeOwner2});
        //console.log(isStoreOwnerApproved, await instance.getApprovedStoreOwnersLength.call(), await instance.getRequestedStoreOwnersLength.call());
        assert.equal(isStoreOwnerApproved, false, "Store Owner 2 is removed by Admin");
        assert.equal(await instance.getApprovedStoreOwnersLength.call(), 1, "1 store owners should be in approved list");
        assert.equal(await instance.getRequestedStoreOwnersLength.call(), 0, "0 store owner should be in requested list");
    });

    it("Only approved Admin can approve the Store Owner request otherwise revert", async() => {
        await catchRevert(instance.approveStoreOwners(storeOwner2, {from:admin2}));
    });

    it("Store Owner present in approved list should not be added again", async() => {
        await catchRevert(instance.addStoreOwner({from:storeOwner1}));
    });

    it("Add StoreOwner 2 again which was earlier removed by the admin", async() => {
        await instance.addStoreOwner({from:storeOwner2});
        const isStoreOwnerApproved = await instance.checkStoreOwnerStatus(storeOwner2, {from:storeOwner2});
        assert.equal(isStoreOwnerApproved, false, "Store Owner should be added but not yet approved by Admin");
        assert.equal(await instance.getRequestedStoreOwnersLength.call(), 1, "Store Owner should be requested");
        assert.equal(await instance.getApprovedStoreOwnersLength.call(), 1, "1 store owners should be in approved list");
    });

});