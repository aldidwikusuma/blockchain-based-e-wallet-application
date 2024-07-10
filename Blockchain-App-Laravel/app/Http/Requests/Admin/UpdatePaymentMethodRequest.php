<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentMethodRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|unique:payment_method_details,name,' . $this->route('payment_method'),
            'editDescription' => 'required',
            'payment_method_category_id' => 'required|exists:payment_methods,id',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama metode pembayaran wajib diisi',
            'name.unique' => 'Nama metode pembayaran sudah ada',
            'editDescription.required' => 'Deskripsi metode pembayaran wajib diisi',
            'payment_method_category_id.required' => 'Kategori metode pembayaran wajib diisi',
            'payment_method_category_id.exists' => 'Kategori metode pembayaran tidak ditemukan',
        ];
    }
}
