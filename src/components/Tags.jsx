import React from "react";
import { Link } from "gatsby";

const Tags = ({ label, prefix, values }) => (
  <section>
    <p>
      <strong>{label}:</strong>{" "}
      {values.map(({ slug, name }) => (
        <React.Fragment key={slug}>
          <Link to={`/${prefix}/${slug}/`}>{name}</Link>{" "}
        </React.Fragment>
      ))}
    </p>
  </section>
);

export default Tags;
