// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract TransactionWalletContract {
    struct Transaction {
        string userId;
        int256 amount;
        string transactionType;
        string status;
        string code;
        uint createdAt;
        uint paymentMethodDetailId; 
    }

    mapping(string => Transaction[]) private userTransactions;
    Transaction[] private allTransactions;

    event TransactionAdded(
        string userId,
        int256 amount,
        uint paymentMethodDetailId,
        string transactionType,
        string status,
        string code,
        uint createdAt
        
    );

    function addWalletTransaction(
        string memory _userId,
        int256 _amount,
        uint _paymentMethodDetailId,
        string memory _transactionType,
        string memory _status,
        string memory _code,
        uint _createdAt
        
    ) public {
        Transaction memory newTransaction = Transaction({
            userId: _userId,
            amount: _amount,
            paymentMethodDetailId: _paymentMethodDetailId,
            transactionType: _transactionType,
            status: _status,
            code: _code,
            createdAt: _createdAt
            
        });

        userTransactions[_userId].push(newTransaction);
        allTransactions.push(newTransaction);

        emit TransactionAdded(
            _userId,
            _amount,
            _paymentMethodDetailId,
            _transactionType,
            _status,
            _code,
            _createdAt
        );
    }

    function getWalletTransactionsByUserId(string memory _userId) public view returns (Transaction[] memory) {
        return userTransactions[_userId];
    }

    function getAllWalletTransactions() public view returns (Transaction[] memory) {
        return allTransactions;
    }

    function getCountWalletTransaction() public view returns (uint256) {
        return allTransactions.length;
    }

    function getWalletBalanceByUserId(string memory _userId) public view returns (int256) {
        int256 balance = 0;
        Transaction[] memory transactions = userTransactions[_userId];
        for (uint256 i = 0; i < transactions.length; i++) {
            balance += transactions[i].amount;
        }
        return balance;
    }
}
