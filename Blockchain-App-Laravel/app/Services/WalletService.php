<?php

namespace App\Services;

use APIHelper;
use Ramsey\Uuid\Uuid;
use App\Models\WalletTransactionUser;

/**
 * Class WalletService.
 */
class WalletService
{
    public static function storeWalletTransaction(array $data, $type)
    {
        $data = [
            'user_id' => auth()->id(),
            'amount' => $data['amount'],
            'payment_method_detail_id' => $data['payment_method_detail_id'],
            'status' => 'pending',
            'type' => $type,
            'code' => self::generateCode($type),
        ];
        $data = WalletTransactionUser::create($data);
        
        $postData = [
                    'userId' => auth()->id(),
                    'amount' => $data->amount,
                    'payment_method_detail_id' => $data['payment_method_detail_id'],
                    'transactionType' => $type,
                    'status' => 'accepted',
                    'code' => self::generateCode($type),
                    'createdAt' => date('c')
                ];
        self::postTransaction($postData);
        
        return $data;
    }

    public static function ajaxDatatableByAdmin()
    {
        $query = WalletTransactionUser::with(['user', 'paymentMethodDetail'])->latest();
        return DatatableService::buildDatatable(
            $query,
            'auth.admin.wallet_transaction.action'
        );
    }

    public static function uploadPaymentProof($walletTransactionId, $proofOfPayment)
    {
        $waleltTransaction = self::getWalletTransactionById($walletTransactionId);
        $filename = Uuid::uuid4()->toString() . '.' . $proofOfPayment->getClientOriginalExtension();
        $proofOfPayment->storeAs('wallet_transaction_user/payment_proof', $filename, 'public');
        $path = 'storage/wallet_transaction_user/payment_proof/' . $filename;

        $waleltTransaction->update([
            'payment_proof' => $path,
        ]);

        return $waleltTransaction;
    }

    // getWalletTransactionById
    public static function getWalletTransactionById($walletTransactionId)
    {
        return WalletTransactionUser::find($walletTransactionId);
        
    }

    public static function ajaxDatatableByUser()
    {
        $query = WalletTransactionUser::with(['paymentMethodDetail'])->where('user_id', auth()->id())->latest();
        return DatatableService::buildDatatable(
            $query,
            'auth.user.my_wallet.action'
        );
    }

    public static function rejectWalletTransaction($topUpWalletId)
    {
        $topup = WalletTransactionUser::find($topUpWalletId);
        $topup->update(['status' => 'rejected']);
        $topup->save();
    }

    public static function acceptWalletTransaction($topUpWalletId)
    {
        $topup = WalletTransactionUser::find($topUpWalletId);
        $topup->update(['status' => 'accepted']);
        self::updateUserBallance($topup->user_id, $topup->amount, 'topup');
        $topup->save();
    }

//     public static function acceptWalletTransaction($topUpWalletId)
// {
//     $topup = WalletTransactionUser::find($topUpWalletId);
//     $transactionType = 'topup'; // Adjust the type as necessary
//     $topup->update(['status' => 'accepted']);
//     $topup->save();
    
//     $postData = [
//         'userId' => $topup->user_id,
//         'transactionType' => 'Top Up',
//         'status' => 'accepted',
//         'amount' => $topup->amount,
//         'createdAt' => date('c')
//     ];

//     $response = self::postTransaction($postData);

//     if ($response->success) {
//         self::updateUserBallance($topup->user_id, $topup->amount, $transactionType);
//     } else {
//         // Handle API post failure if needed
//         throw new \Exception('Failed to post transaction to API');
//     }

//     return $response;
// }

    private static function updateUserBallance($userId, $totalPrice, $type)
    {
        $user = UserService::getUserById($userId);
        if ($type == 'topup') {
            $user->wallet->deposit($totalPrice, ['description' => 'Topup wallet']);
        } else {
            $user->wallet->withdraw($totalPrice, ['description' => 'Withdraw wallet']);
        }


    }


    private static function generateCode($type): string
    {
        // $table->enum('type', ['topup', 'withdraw', 'withdraw_campaign', 'topup_campaign', 'profit_sharing_payment']);
        if ($type == 'topup') {
            $code = 'TP' . date('YmdHis') . rand(1000, 9999);
        } elseif ($type == 'withdraw') {
            $code = 'WD' . date('YmdHis') . rand(1000, 9999);
        } elseif ($type == 'withdraw_campaign') {
            $code = 'WDC' . date('YmdHis') . rand(1000, 9999);
        } elseif ($type == 'topup_campaign') {
            $code = 'TPC' . date('YmdHis') . rand(1000, 9999);
        } elseif ($type == 'profit_sharing_payment') {
            $code = 'PSP' . date('YmdHis') . rand(1000, 9999);
        }


        if (WalletTransactionUser::where('code', $code)->exists()) {
            return self::generateCode($type);
        }
        return $code;
    }

    private static function postTransaction(array $data)
    {
        $data['amount'] = (int) $data['amount'];  // Ensure amount is an integer
        $response = APIHelper::httpPost('addWalletTransaction', $data);
        return $response;
    }

    private static function mappingTransaction($transactionsData, $isSingle = false)
    {
        $transactionMapped = [];

        if (is_object($transactionsData)) {
            $transactionsData = [$transactionsData];
        }

        foreach ($transactionsData as $transaction) {
            $transactionMapped[] = [
                'code' => $transaction->code,
                'user_id' => $transaction->userId,
                'amount' => $transaction->amount,
                'status' => $transaction->status,
                'type' => $transaction->transactionType,
                'created_at' => $transaction->createdAt,
            ];
        }
        if ($isSingle) {
            return APIHelper::encodeDecode($transactionMapped[0]);
        }

        // dd($transactionMapped);
        return $transactionMapped;
    }

    private static function ifTransactionNotFound($transactions)
    {
        if (isset($transactions->error) && $transactions->error == 'Transaction not found') {
            return true;
        }
        return false;
    }

    public static function getWalletTransactionByUserId(){
        $transactions = APIHelper::httpGet('getTransactionByUserId', auth()->user()->id);
        if (self::ifTransactionNotFound($transactions)) {
            return [];
        }
        $transactionData = (array) $transactions->data;
        usort($transactionData, function ($a, $b) {
            return $b->createdAt <=> $a->createdAt;
        });
        return self::mappingTransaction($transactions->data);
    }
}