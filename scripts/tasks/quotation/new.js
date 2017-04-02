﻿function initializeUI() {
    const template = `<div class="one summary items">
                            <div class="terms item">
                                <div class ="description">${window.translate("TermsAndConditions")}</div>
                                <div class="control">
                                    <textarea id="TermsTextArea" type="text"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="one summary items">
                            <div class="terms item">
                                <div class ="description">${window.translate("InternalMemo")}</div>
                                <div class="control">
                                    <textarea id="InternalMemoTextArea" type="text"></textarea>
                                </div>
                            </div>
                        </div>`;

    $(".page.title").html("Sales Quotation");

    const expectedDeliveryDate =
        $("<input type='text' class='date' value='7d' id='ExpectedDeliveryDateInputText' />");
    $("#BookDateInputDate").after(expectedDeliveryDate).remove();
    expectedDeliveryDate.parent().parent().find(".description").html(window.translate("ExpectedDeliveryDate"));

    $("#StatementReferenceInputText").closest(".two.summary.items").attr("class", "one summary items")
        .after(template);

    $(".memo.item").remove();
    $("#CostCenterSelect").closest(".two.summary.items").attr("class", "one summary items");
    $(".cost.center.item").remove();
    $(".store.item").remove();

    window.loadDatepicker();
};

initializeUI();

function getModel() {
    function getDetails() {
        const items = $("#SalesItems .item");
        var model = [];

        $.each(items, function () {
            const el = $(this);
            const itemId = window.parseInt2(el.attr("data-item-id"));
            const quantity = window.parseFloat2(el.find("input.quantity").val());
            const unitId = window.parseInt2(el.find("select.unit").val());
            const price = window.parseFloat2(el.find("input.price").val()) || 0;
            const discount = window.parseFloat2(el.find("input.discount").val()) || 0;
            const tax = window.parseFloat2(el.find(".tax-amount").html()) || 0;

            model.push({
                ValueDate: $("#ValueDateInputDate").datepicker("getDate"),
                ItemId: itemId,
                Quantity: quantity,
                UnitId: unitId,
                Price: price,
                Tax: tax,
                DiscountRate: discount
            });
        });

        return model;
    };

    const valueDate = $("#ValueDateInputDate").datepicker("getDate");
    const expectedDeliveryDate = $("#ExpectedDeliveryDateInputText").datepicker("getDate");
    const referenceNumber = $("#ReferenceNumberInputText").val();
    const terms = $("#TermsTextArea").val();
    const internalMemo = $("#InternalMemoTextArea").val();
    const customerId = $("#CustomerSelect").val();
    const priceTypeId = $("#PriceTypeSelect").val();
    const shipperId = $("#ShipperSelect").val();
    const details = getDetails();

    return {
        ValueDate: valueDate,
        ExpectedDeliveryDate: expectedDeliveryDate,
        ReferenceNumber: referenceNumber,
        Terms: terms,
        InternalMemo: internalMemo,
        CustomerId: customerId,
        PriceTypeId: priceTypeId,
        ShipperId: shipperId,
        Details: details
    };
};

$("#CheckoutButton").off("click").on("click", function () {
    function request(model) {
        const url = "/dashboard/sales/tasks/quotation/new";
        const data = JSON.stringify(model);
        return window.getAjaxRequest(url, "POST", data);
    };


    const model = getModel();

    if (!model.Details.length) {
        alert(window.translate("PleaseSelectItem"));
        return;
    };

    const confirmed = confirm(window.translate("AreYouSure"));

    if (!confirmed) {
        return;
    };


    $("#CheckoutButton").addClass("loading");

    const ajax = request(model);

    ajax.success(function (response) {
        const id = response;
        document.location = `/dashboard/sales/tasks/quotation/checklist/${id}`;
    });

    ajax.fail(function (xhr) {
        $("#CheckoutButton").removeClass("loading");
        window.logAjaxErrorMessage(xhr);
    });
});

window.overridePath = "/dashboard/sales/tasks/quotation";
