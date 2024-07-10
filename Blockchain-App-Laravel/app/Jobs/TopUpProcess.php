<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use App\Services\WalletService;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class AddTransactionDetailProcess implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userId;
    protected $amount;
    protected $transactionType;
    protected $status;

    public function __construct($userId, $amount, $transactionType, $status)
    {
        $this->userId = $userId;
        $this->amount = $amount;
        $this->transactionType = $transactionType;
        $this->status = $status;
    }

    public function handle()
    {
        $timenow = now()->toDateTimeString();
        Log::channel('queue_logs')->info('Job started at ' . $timenow);
        Log::channel('queue_logs')->info('Job data: ' . $this->userId . ', ' . $this->amount . ', ' . $this->transactionType . ', ' . $this->status);


//         // Lakukan pekerjaan antrian Anda di sini
//         try {
//             TransactionService::addTransactionDetail($this->relatedCampaign, $this->transactionCode, $this->quantity, $this->orderType, $this->userId);
//         } catch (\Exception $e) {
//             Log::channel('queue_logs')->error('Error executing addTransactionDetail: ' . $e->getMessage());
//         }
    }
}