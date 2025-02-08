// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Registry {
    struct Landreg {
        uint id;
        uint area;
        string city;
        string state;
        uint landPrice;
        uint propertyPID;
        uint physicalSurveyNumber;
        string ipfsHash;
        string document;
    }

    struct Buyer {
        address id;
        string name;
        uint age;
        string city;
        string aadharNumber;
        string panNumber;
        string document;
        string email;
    }

    struct Seller {
        address id;
        string name;
        uint age;
        string aadharNumber;
        string panNumber;
        string landsOwned;
        string document;
    }

    struct LandInspector {
        uint id;
        string name;
        uint age;
        string designation;
    }

    struct LandRequest {
        uint reqId;
        address sellerId;
        address buyerId;
        uint landId;
    }

    mapping(uint => Landreg) public lands;
    mapping(uint => LandInspector) public InspectorMapping;
    mapping(address => Seller) public SellerMapping;
    mapping(address => Buyer) public BuyerMapping;
    mapping(uint => LandRequest) public RequestsMapping;

    mapping(address => bool) public RegisteredAddressMapping;
    mapping(address => bool) public RegisteredSellerMapping;
    mapping(address => bool) public RegisteredBuyerMapping;
    mapping(address => bool) public SellerVerification;
    mapping(address => bool) public SellerRejection;
    mapping(address => bool) public BuyerVerification;
    mapping(address => bool) public BuyerRejection;
    mapping(uint => bool) public LandVerification;
    mapping(uint => address) public LandOwner;
    mapping(uint => bool) public RequestStatus;
    mapping(uint => bool) public RequestedLands;
    mapping(uint => bool) public PaymentReceived;

    address public Land_Inspector;
    address[] public sellers;
    address[] public buyers;

    uint public landsCount;
    uint public inspectorsCount;
    uint public sellersCount;
    uint public buyersCount;
    uint public requestsCount;

    event Registration(address indexed registrationId);
    event AddingLand(uint indexed landId);
    event LandRequested(address indexed sellerId);
    event RequestApproved(address indexed buyerId);
    event Verified(address indexed id);
    event Rejected(address indexed id);

    modifier onlyLandInspector() {
        require(msg.sender == Land_Inspector, "Only Land Inspector can perform this action");
        _;
    }

    constructor() {
        Land_Inspector = msg.sender;
        addLandInspector("Inspector 1", 45, "Tehsil Manager");
    }

    function addLandInspector(string memory _name, uint _age, string memory _designation) private {
        unchecked {
            inspectorsCount++;
        }
        InspectorMapping[inspectorsCount] = LandInspector(inspectorsCount, _name, _age, _designation);
    }

    function verifySeller(address _sellerId) public onlyLandInspector {
        SellerVerification[_sellerId] = true;
        emit Verified(_sellerId);
    }

    function rejectSeller(address _sellerId) public onlyLandInspector {
        SellerRejection[_sellerId] = true;
        emit Rejected(_sellerId);
    }

    function verifyBuyer(address _buyerId) public onlyLandInspector {
        BuyerVerification[_buyerId] = true;
        emit Verified(_buyerId);
    }

    function rejectBuyer(address _buyerId) public onlyLandInspector {
        BuyerRejection[_buyerId] = true;
        emit Rejected(_buyerId);
    }

    function verifyLand(uint _landId) public onlyLandInspector {
        LandVerification[_landId] = true;
    }

    function addLand(
        uint _area,
        string memory _city,
        string memory _state,
        uint _landPrice,
        uint _propertyPID,
        uint _surveyNum,
        string memory _ipfsHash,
        string memory _document
    ) public {
        require(RegisteredSellerMapping[msg.sender] && SellerVerification[msg.sender], "Seller not verified");

        unchecked {
            landsCount++;
        }
        lands[landsCount] = Landreg(landsCount, _area, _city, _state, _landPrice, _propertyPID, _surveyNum, _ipfsHash, _document);
        LandOwner[landsCount] = msg.sender;
    }

    function registerSeller(
        string memory _name,
        uint _age,
        string memory _aadharNumber,
        string memory _panNumber,
        string memory _landsOwned,
        string memory _document
    ) public {
        require(!RegisteredAddressMapping[msg.sender], "Already registered");

        RegisteredAddressMapping[msg.sender] = true;
        RegisteredSellerMapping[msg.sender] = true;

        unchecked {
            sellersCount++;
        }
        SellerMapping[msg.sender] = Seller(msg.sender, _name, _age, _aadharNumber, _panNumber, _landsOwned, _document);
        sellers.push(msg.sender);
        emit Registration(msg.sender);
    }

    function registerBuyer(
        string memory _name,
        uint _age,
        string memory _city,
        string memory _aadharNumber,
        string memory _panNumber,
        string memory _document,
        string memory _email
    ) public {
        require(!RegisteredAddressMapping[msg.sender], "Already registered");

        RegisteredAddressMapping[msg.sender] = true;
        RegisteredBuyerMapping[msg.sender] = true;

        unchecked {
            buyersCount++;
        }
        BuyerMapping[msg.sender] = Buyer(msg.sender, _name, _age, _city, _aadharNumber, _panNumber, _document, _email);
        buyers.push(msg.sender);
        emit Registration(msg.sender);
    }

    function requestLand(address _sellerId, uint _landId) public {
        require(RegisteredBuyerMapping[msg.sender] && BuyerVerification[msg.sender], "Buyer not verified");

        unchecked {
            requestsCount++;
        }
        RequestsMapping[requestsCount] = LandRequest(requestsCount, _sellerId, msg.sender, _landId);
        RequestStatus[requestsCount] = false;
        RequestedLands[requestsCount] = true;

        emit LandRequested(_sellerId);
    }

    function approveRequest(uint _reqId) public {
        require(RegisteredSellerMapping[msg.sender] && SellerVerification[msg.sender], "Seller not verified");
        RequestStatus[_reqId] = true;
    }

    function LandOwnershipTransfer(uint _landId, address _newOwner) public onlyLandInspector {
        LandOwner[_landId] = _newOwner;
    }

    function payment(address payable _receiver, uint _landId) public payable {
        PaymentReceived[_landId] = true;
        _receiver.transfer(msg.value);
    }

    function isLandVerified(uint _id) public view returns (bool) {
        return LandVerification[_id];
    }

    function isVerified(address _id) public view returns (bool) {
        return SellerVerification[_id] || BuyerVerification[_id];
    }

    function isRejected(address _id) public view returns (bool) {
        return SellerRejection[_id] || BuyerRejection[_id];
    }

    function isSeller(address _id) public view returns (bool) {
        return RegisteredSellerMapping[_id];
    }

    function isBuyer(address _id) public view returns (bool) {
        return RegisteredBuyerMapping[_id];
    }

    function isRegistered(address _id) public view returns (bool) {
        return RegisteredAddressMapping[_id];
    }

    function isRequested(uint _id) public view returns (bool) {
        return RequestedLands[_id];
    }

    function isApproved(uint _id) public view returns (bool) {
        return RequestStatus[_id];
    }

    function isPaid(uint _landId) public view returns (bool) {
        return PaymentReceived[_landId];
    }
}
