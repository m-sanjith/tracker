export default function PriceCards({ current }) {

  // Safely format price
  const formatPrice = (value) => {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "N/A";
    }

    return Number(value).toLocaleString("en-IN");
  };


  return (
    <div className="price-cards">

      {/* 22KT GOLD */}

      <div className="price-card">

        <h3>
          22KT Gold
        </h3>

        <div className="price">
          ₹{formatPrice(current.gold22)}
        </div>

        <p>
          Price per 1 gram
        </p>

      </div>


      {/* 18KT GOLD */}

      <div className="price-card">

        <h3>
          18KT Gold
        </h3>

        <div className="price">
          ₹{formatPrice(current.gold18)}
        </div>

        <p>
          Price per 1 gram
        </p>

      </div>


      {/* SILVER */}

      <div className="price-card">

        <h3>
          Silver
        </h3>

        <div className="price">
          ₹{formatPrice(current.silver)}
        </div>

        <p>
          Price per 1 gram
        </p>

      </div>

    </div>
  );
}