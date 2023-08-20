function calculateAsphalt() {
    // Valid For Input
    const valid_for = parseFloat(document.getElementById('valid_for').value);
    // Current date
    const currentDate = new Date();
    let currentDay = String(currentDate.getDate()).padStart(2, '0');
    let currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    let currentYear = currentDate.getFullYear();
    let formattedCurrentDate = `${currentDay}-${currentMonth}-${currentYear}`;
    // Due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + valid_for);
    let dueDay = String(dueDate.getDate()).padStart(2, '0');
    let dueMonth = String(dueDate.getMonth() + 1).padStart(2, '0');
    let dueYear = dueDate.getFullYear();
    let formattedDueDate = `${dueDay}-${dueMonth}-${dueYear}`;
    // Get the result container element
    const resultContainer = document.getElementById('result');
    // Clear previous results and show the result container
    resultContainer.innerHTML = '';
    resultContainer.style.display = 'block';
    // Create an empty object to store the results
    const results = {};
    // Traffic Control
    const traffic_control_required = document.getElementById('traffic_control').value;
    const traffic_control_hours_required = document.getElementById('traffic_control_hours_required').value;
    const traffic_control_workers_required = document.getElementById('traffic_control_workers_required').value;
    // Waste disposal
    const waste_disposal_required = document.getElementById('waste_disposal').value;
    const waste_type = document.getElementById('waste_type').value;
    const waste_total_loads = document.getElementById('waste_loads').value;
    // Get Project Details Section Input Values
    const project_firstName = document.getElementById('project_firstname').value
    const project_lastName = document.getElementById('project_lastname').value
    const project_email = document.getElementById('project_email').value
    const project_mobile = document.getElementById('project_mobile').value
    const project_phone = document.getElementById('project_phone').value
    const project_address = document.getElementById('project_address').value
    const project_city = document.getElementById('project_city').value
    const project_apartment = document.getElementById('project_apartment').value
    const project_abn = document.getElementById('project_abn').value
    const project_fax = document.getElementById('project_fax').value
    const project_state = document.getElementById('project_state').value
    const project_postcode = document.getElementById('project_postcode').value
    const project_company = document.getElementById('project_company').value
    const project_country = document.getElementById('project_country').value
    // Get type of service
    const service_type = document.getElementById('service_type').value
    // Get Asphalt Section Input Values
    const area = parseFloat(document.getElementById('area').value);
    const depth = parseFloat(document.getElementById('depth').value) / 1000;
    const density = parseFloat(document.getElementById('asphalt_density').value) / 1000;
    const cost_per_tonne = parseFloat(document.getElementById('cost_per_tonne').value)
    // Get Foundation Section Input Values
    const base_area = parseFloat(document.getElementById('base_area').value);
    const base_depth = parseFloat(document.getElementById('base_depth').value) / 1000;
    const base_density = parseFloat(document.getElementById('base_density').value) / 1000;
    const base_cost_per_tonne = parseFloat(document.getElementById('base_cost_per_tonne').value)
    // Get Labor Section Input Values
    const workers_required = parseFloat(document.getElementById('required_workers').value);
    const time_to_complete_job = parseFloat(document.getElementById('time_to_complete_job').value);
    const superannuation = parseFloat(document.getElementById('superannuation').value / 100);
    const workers_compensation = parseFloat(document.getElementById('workers_compensation').value / 100);
    const other_labor_costs = parseFloat(document.getElementById('other_labor_costs').value / 100);
    const hourly_rate = parseFloat(document.getElementById('hourly_rate').value) * (1 + (superannuation + workers_compensation + other_labor_costs));
    // Get Consumable Input values
    const paint_required = parseFloat(document.getElementById('paint_required').value);
    const paint_cost = parseFloat(document.getElementById('paint_cost').value);
    const petrol_required = parseFloat(document.getElementById('petrol_required').value);
    const petrol_cost = parseFloat(document.getElementById('petrol_cost').value);
    const diesel_required = parseFloat(document.getElementById('diesel_required').value);
    const diesel_cost = parseFloat(document.getElementById('diesel_cost').value);
    const gas_required = parseFloat(document.getElementById('gas_required').value);
    const gas_cost = parseFloat(document.getElementById('gas_cost').value);
    //Get equipment values
    const compactor_plate = parseFloat(document.getElementById('compactor_plate').value);
    const rammer_compactor = parseFloat(document.getElementById('rammer_compactor').value);
    const leaf_blower = parseFloat(document.getElementById('leaf_blower').value);
    const concrete_cutter = parseFloat(document.getElementById('concrete_cutter').value);
    const skidsteer = parseFloat(document.getElementById('skidsteer').value);
    const mr_truck = parseFloat(document.getElementById('mr_truck').value);
    const hr_truck = parseFloat(document.getElementById('hr_truck').value);
    const trailer = parseFloat(document.getElementById('trailer').value);
    const car = parseFloat(document.getElementById('car').value);
    const _1t_roller = parseFloat(document.getElementById('_1t_roller').value);
    const _2t_roller = parseFloat(document.getElementById('_2t_roller').value);
    // Get Other Details Section Input Values
    const quote_number = document.getElementById('quote_number').value;
    // Get Profit Section Input Values
    const profit_margin = parseFloat(document.getElementById('profit_margin').value) / 100;
    // Get Taxes Section Input Values
    const tax_rate = parseFloat(document.getElementById('tax_rate').value) / 100;
    // Get Notes Section Input values
    const project_notes = document.getElementById('project_notes').value;
    //
    //
    //
    //Calculations
    //
    //
    //

    // Calculate Consumable Costs
    const total_paint_cost = paint_required * paint_cost;
    const total_petrol_cost = petrol_required * petrol_cost;
    const total_diesel_cost = diesel_required * diesel_cost;
    const total_gas_cost = gas_required * gas_cost;
    const total_cost_of_consumables = total_paint_cost + total_petrol_cost + total_diesel_cost + total_gas_cost;
    // Calculate Labor costs
    const total_labor_cost = workers_required * (time_to_complete_job * hourly_rate);
    // Calculate Days to Complete job
    const total_days = time_to_complete_job / 10;
    // Calculate daily equipment depreciation (Formula: Annual depreciation = (acquisition cost – residual value) / years of useful life)
    const compactor_plate_depreciation = ((compactor_plate * (3000 - 200) / 3) / 260) * total_days;
    const rammer_compactor_depreciation = ((rammer_compactor * (1500 - 200) / 3) / 260) * total_days;
    const leaf_blower_depreciation = ((leaf_blower * (500 - 150) / 3) / 260) * total_days;
    const concrete_cutter_depreciation = ((concrete_cutter * (500 - 150) / 3) / 260) * total_days;
    const skidsteer_depreciation = ((skidsteer * (40000 - 10000) / 10) / 260) * total_days;
    const mr_truck_depreciation = ((mr_truck * (40000 - 10000) / 10) / 260) * total_days;
    const hr_truck_depreciation = ((hr_truck * (50000 - 20000) / 10) / 260) * total_days;
    const trailer_depreciation = ((trailer * (3500 - 1000) / 10) / 260) * total_days;
    const car_depreciation = ((car * (35000 - 1000) / 10) / 260) * total_days;
    const _1t_roller_depreciation = ((_1t_roller * (25000 - 5000) / 5) / 260) * total_days;
    const _2t_roller_depreciation = ((_2t_roller * (35000 - 10000) / 5) / 260) * total_days;
    const total_depreciation = compactor_plate_depreciation + rammer_compactor_depreciation + leaf_blower_depreciation + concrete_cutter_depreciation + skidsteer_depreciation + trailer_depreciation + car_depreciation + mr_truck_depreciation + hr_truck_depreciation + _1t_roller_depreciation + _2t_roller_depreciation;
    // Calculate volume of asphalt
    const volume = area * depth;
    // Calculate weight of asphalt
    const weight = volume * density;
    // Calculate weight with margin of error (0%) of asphalt
    const weightWithMargin = weight * 1.00;
    // Calculate the total cost of the Asphalt
    const cost_of_asphalt = weightWithMargin * cost_per_tonne;
    // Calculate volume of base
    const base_volume = base_area * base_depth;
    // Calculate weight of base
    const base_weight = base_volume * base_density;
    // Calculate weight with margin of error (0%) of base
    const base_weightWithMargin = base_weight * 1.00;
    // Calculate the total cost of the Asphalt
    const cost_of_base = base_weightWithMargin * base_cost_per_tonne;
    // Calculate the total cost of emulsion required with 5% margin of error (0.5 * 1.5)
    const cost_emulsion = (0.5 * 1.5) * area * 1.05;
    // Calculate the total litres required (0.5L/Sq M)
    const amount_required_emulsion = area * 0.25;
    // Calculate the total costs
    const total_costs = total_labor_cost + cost_of_asphalt + cost_of_base + total_depreciation;
    // Calculate the quote
    const quote = total_costs / (1 - profit_margin);
    // Calculate the profit
    const profit = quote - total_costs;

    // String Together Client Name & Address
    const project_address_string = project_address + ', ' + project_city + ' ' + project_postcode + ', ' + project_state + ', ' + project_country;
    const client_fullname = project_firstName + ' ' + project_lastName;

    // Display result
    document.getElementById('result').innerHTML = `
    <div class="results_container">
      <p class="text-align-right">PROJECT No. ${quote_number}</p>
      <div class="row align-items-start space-between">
        <div class="flex-grow-1">
        <h3>Project Details</h3>
          <p>Service: ${service_type}</p>
          <p>Date created: ${formattedCurrentDate}</p>
          <p>Valid until: ${formattedDueDate}</p>
          <p>Subtotal: $${quote.toFixed(2)}</p>
          <p>Taxes: $${((quote * (1 + tax_rate)) - quote).toFixed(2)}</p>
          <p>Quote: $${(quote * (1 + tax_rate)).toFixed(2)} or $${((quote * (1 + tax_rate)) / area).toFixed(2)} per square meter</p>
          <p>Deposit due: $${total_costs.toFixed(2)}</p>
          <p>Traffic Control: ${traffic_control_required}</p>
          <p>Waste Disposal: ${waste_disposal_required}</p>
        </div>
        <div class="flex-grow-1">
          <h3>Client Details</h3>
          <p>Client name: ${client_fullname}</p>
          <p>Project address: ${project_address_string}</p>
          <p>Mobile: ${project_mobile}</p>
          <p>Email: ${project_email}</p>
          <p>Company: ${project_company}</p>
          <p>ABN/ACN: ${project_abn}</p>
          <p>Phone: ${project_phone}</p>
          <p>Fax: ${project_fax}</p>
        </div>
      </div>
    </div>

    <div class="row align-items-start space-between">
      <div class="results_container">
        <h3>Notes</h3>
        <p>${project_notes}</p>
      </div>

      <div class="results_container">
        <h3>Materials Required</h3>
        <p>Asphalt: ${weightWithMargin.toFixed(2)} Tonnes</p>
        <p>Base: ${base_weightWithMargin.toFixed(2)} Tonnes</p>
        <p>Emulsion: ${amount_required_emulsion.toFixed(2)} Litres</p>
        <p>Petrol: ${petrol_required} Litres</p>
        <p>Diesel: ${diesel_required} Litres</p>
        <p>Gas: ${gas_required} Kilograms</p>
      </div>
    </div>

    <div class="row align-items-start space-between">
      <div class="results_container">
        <h3>Total Costs</h3>
        <p>Asphalt: $${cost_of_asphalt.toFixed(2)}</p>
        <p>Base: $${cost_of_base.toFixed(2)}</p>
        <p>Emulsion: $${cost_emulsion.toFixed(2)}</p>
        <p>Labor: $${total_labor_cost.toFixed(2)}</p>
        <p>Depreciation: $${total_depreciation.toFixed(2)}</p>
        <p>Consumables: $${total_cost_of_consumables.toFixed(2)}</p>
        <p>Cost / sq m: $${(total_costs / area).toFixed(2)}</p>
        <p>Total cost: $${total_costs.toFixed(2)}</p>
      </div>

      <div class="results_container">
        <h3>Profit</h3>
        <p>Profit margin: ${profit_margin * 100}%</p>
        <p>Total hours: ${time_to_complete_job}</p>
        <p>Total days: ${total_days.toFixed(1)}</p>
        <p>Profit: $${profit.toFixed(2)}</p>
        <p>Profit / sq m: $${(profit / area).toFixed(2)}</p>
        <p>Profit / hour: $${(profit / time_to_complete_job).toFixed(2)}</p>
      </div>
    </div>

    <div class="results_stats">
      <div class="row align-items-start space-between">
        <div class="results_container flex-grow-1">
          <h3>Labor</h3>
          <p>Total Paid Hours: ${workers_required * time_to_complete_job}</p>
          <p>Hourly Cost: $${hourly_rate.toFixed(2)}</p>
          <p>Cost / sq m: $${(total_labor_cost / area).toFixed(2)}</p>
          <p>Total Cost: $${total_labor_cost.toFixed(2)}</p>
        </div>

        <div class="results_container flex-grow-1">
          <h3>Asphalt</h3>
          <p>Area: ${area.toFixed(2)} m2</p>
          <p>Volume: ${volume.toFixed(2)} m³</p>
          <p>Amount required: ${weightWithMargin.toFixed(2)} Tonnes</p>
          <p>Cost / sq m: $${(cost_of_asphalt / area).toFixed(2)}</p>
          <p>Total cost: $${cost_of_asphalt.toFixed(2)}</p>
        </div>
      </div>
      <div class="row align-items-start space-between">
        <div class="results_container flex-grow-1">
          <h3>Base</h3>
          <p>Area: ${base_area.toFixed(2)} m2</p>
          <p>Volume: ${base_volume.toFixed(2)} m³</p>
          <p>Amount required: ${base_weightWithMargin.toFixed(2)} Tonnes</p>
          <p>Cost / sq m: $${(cost_of_base / base_area).toFixed(2)}</p>
          <p>Total cost: $${(base_weightWithMargin * base_cost_per_tonne).toFixed(2)}</p>
        </div>

        <div class="results_container flex-grow-1">
          <h3>Emulsion</h3>
          <p>Area: ${area} m2</p>
          <p>Amount required: ${amount_required_emulsion.toFixed(2)} Litres</p>
          <p>Cost / sq m: $${(cost_emulsion / area).toFixed(2)}</p>
          <p>Total cost: $${cost_emulsion.toFixed(2)}</p>
        </div>
      </div>

      <div class="results_container">
        <h3>Depreciation</h3>
        <p>Compactor Plates: $${compactor_plate_depreciation.toFixed(2)}</p>
        <p>Rammer Compactors: $${rammer_compactor_depreciation.toFixed(2)}</p>
        <p>Leaf Blowers: $${leaf_blower_depreciation.toFixed(2)}</p>
        <p>Concrete Cutters: $${concrete_cutter_depreciation.toFixed(2)}</p>
        <p>Car: $${car_depreciation.toFixed(2)}</p>
        <p>Trailer: $${trailer_depreciation.toFixed(2)}</p>
        <p>MR Truck: $${mr_truck_depreciation.toFixed(2)}</p>
        <p>HR Truck: $${hr_truck_depreciation.toFixed(2)}</p>
        <p>1t Roller: $${_1t_roller_depreciation.toFixed(2)}</p>
        <p>2t Roller: $${_2t_roller_depreciation.toFixed(2)}</p>
        <p>Skidsteer: $${skidsteer_depreciation.toFixed(2)}</p>
      </div>
    </div>
    `;
};
