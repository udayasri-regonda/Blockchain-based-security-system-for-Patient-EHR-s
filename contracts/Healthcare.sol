// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Healthcare EHR
 * @dev Blockchain-Based EHR Security System - B.Tech Final Year Project
 */
contract Healthcare {
    struct Patient {
        string name;
        uint age;
        string medicalHistory;
        string bloodGroup;
        string contactNumber;
        address[] authorizedDoctors;
        bool isRegistered;
        uint registeredAt;
        uint lastUpdated;
    }

    struct Doctor {
        string name;
        string specialization;
        bool isRegistered;
        uint registeredAt;
    }

    struct AccessLog {
        address accessor;
        address patient;
        string action;
        uint timestamp;
    }

    address[] private patientsList;
    address[] private doctorsList;
    mapping(address => Patient) private patients;
    mapping(address => Doctor) private doctors;
    mapping(address => mapping(address => bool)) public authorizedDoctors;
    AccessLog[] private accessLogs;
    address private admin;
    uint private totalTransactions;

    event PatientRegistered(address indexed patient, string name, uint timestamp);
    event PatientUpdated(address indexed patient, string updatedField, uint timestamp);
    event DoctorRegistered(address indexed doctor, string name, uint timestamp);
    event DoctorAuthorized(address indexed patient, address indexed doctor, uint timestamp);
    event DoctorRevoked(address indexed patient, address indexed doctor, uint timestamp);
    event EmergencyAccess(address indexed patient, address indexed admin, uint timestamp);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin, uint timestamp);

    modifier onlyAdmin() { require(msg.sender == admin, "Only admin"); _; }
    modifier onlyRegisteredDoctor() { require(doctors[msg.sender].isRegistered, "Not a doctor"); _; }
    modifier onlyPatientOrAuthorizedDoctor(address _p) {
        require(msg.sender == _p || authorizedDoctors[_p][msg.sender], "Unauthorized"); _;
    }
    modifier onlyRegisteredPatient() { require(patients[msg.sender].isRegistered, "Not registered"); _; }

    constructor() { admin = msg.sender; }

    function setAdmin(address newAdmin) public onlyAdmin {
        emit AdminChanged(admin, newAdmin, block.timestamp);
        admin = newAdmin;
    }
    function getAdmin() public view returns (address) { return admin; }

    function registerDoctor(address _addr, string memory _name, string memory _spec) public onlyAdmin {
        require(!doctors[_addr].isRegistered, "Already registered");
        doctors[_addr] = Doctor(_name, _spec, true, block.timestamp);
        doctorsList.push(_addr);
        totalTransactions++;
        emit DoctorRegistered(_addr, _name, block.timestamp);
    }

    function getDoctorDetails(address _addr) public view returns (string memory, string memory, bool, uint) {
        Doctor memory d = doctors[_addr];
        return (d.name, d.specialization, d.isRegistered, d.registeredAt);
    }

    function isDoctor(address _addr) public view returns (bool) { return doctors[_addr].isRegistered; }
    function getAllDoctors() public view onlyAdmin returns (address[] memory) { return doctorsList; }

    function registerPatient(string memory _name, uint _age, string memory _history, string memory _blood, string memory _contact) public {
        require(!patients[msg.sender].isRegistered, "Already registered");
        patients[msg.sender] = Patient(_name, _age, _history, _blood, _contact, new address[](0), true, block.timestamp, block.timestamp);
        patientsList.push(msg.sender);
        totalTransactions++;
        emit PatientRegistered(msg.sender, _name, block.timestamp);
    }

    function updateMedicalHistory(string memory _history) public onlyRegisteredPatient {
        patients[msg.sender].medicalHistory = _history;
        patients[msg.sender].lastUpdated = block.timestamp;
        totalTransactions++;
        emit PatientUpdated(msg.sender, "medicalHistory", block.timestamp);
    }

    function updatePatientDetails(uint _age, string memory _blood, string memory _contact) public onlyRegisteredPatient {
        patients[msg.sender].age = _age;
        patients[msg.sender].bloodGroup = _blood;
        patients[msg.sender].contactNumber = _contact;
        patients[msg.sender].lastUpdated = block.timestamp;
        totalTransactions++;
        emit PatientUpdated(msg.sender, "details", block.timestamp);
    }

    function isPatient(address _addr) public view returns (bool) { return patients[_addr].isRegistered; }

    function authorizeDoctor(address _doctor) public onlyRegisteredPatient {
        require(doctors[_doctor].isRegistered, "Doctor not registered");
        require(!authorizedDoctors[msg.sender][_doctor], "Already authorized");
        authorizedDoctors[msg.sender][_doctor] = true;
        patients[msg.sender].authorizedDoctors.push(_doctor);
        totalTransactions++;
        accessLogs.push(AccessLog(_doctor, msg.sender, "GRANT", block.timestamp));
        emit DoctorAuthorized(msg.sender, _doctor, block.timestamp);
    }

    function revokeDoctorAccess(address _doctor) public onlyRegisteredPatient {
        require(authorizedDoctors[msg.sender][_doctor], "Not authorized");
        authorizedDoctors[msg.sender][_doctor] = false;
        totalTransactions++;
        accessLogs.push(AccessLog(_doctor, msg.sender, "REVOKE", block.timestamp));
        emit DoctorRevoked(msg.sender, _doctor, block.timestamp);
    }

    function getPatientDetails(address _p) public view onlyPatientOrAuthorizedDoctor(_p)
        returns (string memory, uint, string memory, string memory, string memory, uint, uint)
    {
        Patient memory pt = patients[_p];
        require(pt.isRegistered, "Not registered");
        return (pt.name, pt.age, pt.medicalHistory, pt.bloodGroup, pt.contactNumber, pt.registeredAt, pt.lastUpdated);
    }

    function getAuthorizedDoctors(address _p) public view returns (address[] memory) {
        return patients[_p].authorizedDoctors;
    }

    function getPatientsForDoctor(address _doctor) public view onlyRegisteredDoctor returns (address[] memory) {
        uint count = 0;
        for (uint i = 0; i < patientsList.length; i++) {
            if (authorizedDoctors[patientsList[i]][_doctor]) count++;
        }
        address[] memory result = new address[](count);
        uint idx = 0;
        for (uint i = 0; i < patientsList.length; i++) {
            if (authorizedDoctors[patientsList[i]][_doctor]) result[idx++] = patientsList[i];
        }
        return result;
    }

    function getAllPatients() public view onlyAdmin returns (address[] memory) { return patientsList; }

    function getStats() public view returns (uint, uint, uint) {
        return (patientsList.length, doctorsList.length, totalTransactions);
    }

    function emergencyAccess(address _p) public onlyAdmin returns (string memory, uint, string memory) {
        Patient memory pt = patients[_p];
        require(pt.isRegistered, "Not registered");
        accessLogs.push(AccessLog(msg.sender, _p, "EMERGENCY", block.timestamp));
        emit EmergencyAccess(_p, msg.sender, block.timestamp);
        return (pt.name, pt.age, pt.medicalHistory);
    }

    function getAccessLogCount() public view onlyAdmin returns (uint) { return accessLogs.length; }

    function getAccessLog(uint index) public view onlyAdmin returns (address, address, string memory, uint) {
        require(index < accessLogs.length, "Out of range");
        AccessLog memory log = accessLogs[index];
        return (log.accessor, log.patient, log.action, log.timestamp);
    }
}
