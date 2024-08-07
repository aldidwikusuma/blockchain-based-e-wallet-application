<x-containerTemplate pageTitle="User">
    @slot('contentOfContainer')
        <x-headerSection :breadcrumbMenu="['Wallet Transaction']" />

        <x-contentSection>
            @slot('contentOfContentSection')
                <x-tableDatatable header="Wallet Transaction" tableId="walletTransactionTable" :oneRowThArray="['No', 'Code', 'Jumlah', 'Status', 'User', 'Bukti Pembayaran', 'Action']" />
            @endslot
        </x-contentSection>

        @push('custom-scripts')
            <script>
                $(document).on('click', '.accept-modal', function() {
                    let id = $(this).data('id');
                    let amount = $("#amount").val();
                    Swal.fire({
                        title: 'Are you sure?',
                        text: "You want to accept this wallet transaction request?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, accept it!'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $.ajax({
                                url: "{{ route('dashboard.admin.wallet-transaction.accept') }}",
                                type: 'POST',
                                // headers: {
                                //     'Authorization': 'Bearer {{ config('API_TOKEN') }}',
                                // },
                                data: {
                                    id: id,
                                    // transactionType: "Top Up",
                                    // status: "Accepted",
                                    amount: amount,
                                    // createdAt: createdAt,
                                },
                                success: function(response) {
                                    Swal.fire(
                                        'Accepted!',
                                        'This wallet transaction request has been accepted.',
                                        'success'
                                    );
                                    $('#walletTransactionTable').DataTable().ajax.reload();
                                },
                                error: function(response) {
                                    Swal.fire(
                                        'Error!',
                                        'Something went wrong. Please try again.',
                                        'error'
                                    );
                                }
                            });
                        }
                    });
                });

                $(document).on('click', '.reject-modal', function() {
                    let id = $(this).data('id');
                    Swal.fire({
                        title: 'Are you sure?',
                        text: "You want to reject this wallet transaction request?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, reject it!'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $.ajax({
                                url: "{{ route('dashboard.admin.wallet-transaction.reject') }}",
                                type: 'POST',
                                // headers: {
                                //     'Authorization': 'Bearer abc'
                                // },
                                data: {
                                    id: id
                                },
                                success: function(response) {
                                    Swal.fire(
                                        'Rejected!',
                                        'This wallet transaction request has been rejected.',
                                        'success'
                                    );
                                    $('#walletTransactionTable').DataTable().ajax.reload();
                                },
                                error: function(response) {
                                    Swal.fire(
                                        'Error!',
                                        'Something went wrong. Please try again.',
                                        'error'
                                    );
                                }
                            });
                        }
                    });
                });
            </script>
            <script src="{{ asset('assets/js/base/datatable/datatableSettings.js') }}"></script>
            <script src="{{ asset('assets/js/dashboard/admin/walletManagement.js') }}"></script>
            <script src="{{ asset('assets/js/base/datatable/datatableInitializer.js') }}"></script>
        @endpush
    @endslot
</x-containerTemplate>
