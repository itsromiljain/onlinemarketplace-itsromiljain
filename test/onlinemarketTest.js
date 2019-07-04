let catchRevert = require("./exceptionsHelpers.js").catchRevert
var OnlineMarket = artifacts.require("OnlineMarket");

contract("OnlineMarket", accounts => {

    const owner = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];
    const storeOwner1 = accounts[3];
    const storeOwner2 = accounts[4];
    const buyer = accounts[5];

    // Define beforeEach
    before(async() => {
        instance = await OnlineMarket.deployed();
    });

    it("Check Owner is Admin", async() => {
        const ownerEnrolled = await instance.checkAdmin(owner, {from:owner});
        assert.equal(ownerEnrolled, true, "Owner is enrolled");

    });
    it("Add another Admin", async() => {
        await instance.addAdmin(admin1, {from:owner});
        const adminEnrolled = await instance.checkAdmin(admin1, {from:owner});
        assert.equal(adminEnrolled, true, "Another Admin is added successfully");

    });

    it("Add second Admin by first Admin", async() => {
        await instance.addAdmin(admin2, {from:admin1});
        const admin2Enrolled = await instance.checkAdmin(admin2, {from:admin1});
        assert.equal(admin2Enrolled, true, "Second Admin is added successfully by First Admin");

    });

    it("Remove second Admin by Owner", async() => {
        await instance.removeAdmin(admin2, {from:owner});
        const admin2Enrolled = await instance.checkAdmin(admin2, {from:owner});
        assert.equal(admin2Enrolled, false, "Second Admin is not enrolled as removed by Owner");

    });

});