// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

contract WalletTransactionContract {
    struct Transaction {
        string userId;
        int256 amount;
        string transactionType;
        string status;
        string code;
        uint createdAt;
    }

    mapping(string => Transaction[]) private userTransactions;
    Transaction[] private allTransactions;

    event TransactionAdded(
        string userId,
        int256 amount,
        string transactionType,
        string status,
        string code,
        uint createdAt
    );

    function addTransaction(
        string memory _userId,
        int256 _amount,
        string memory _transactionType,
        string memory _status,
        string memory _code,
        uint _createdAt
    ) public {
        Transaction memory newTransaction = Transaction({
            userId: _userId,
            amount: _amount,
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
            _transactionType,
            _status,
            _code,
            _createdAt
        );
    }

    function getTransactionsByUserId(string memory _userId) public view returns (Transaction[] memory) {
        return userTransactions[_userId];
    }

    function getAllTransactions() public view returns (Transaction[] memory) {
        return allTransactions;
    }

    function getCountTransaction() public view returns (uint256) {
        return allTransactions.length;
    }

    function getBalanceByUserId(string memory _userId) public view returns (int256) {
        int256 balance = 0;
        Transaction[] memory transactions = userTransactions[_userId];
        for (uint256 i = 0; i < transactions.length; i++) {
            balance += transactions[i].amount;
        }
        return balance;
    }
}