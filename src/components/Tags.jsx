import React from "react";
import { Link } from "gatsby";

// Utility function to generate slug from name
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const Tags = ({ label, prefix, values }) => {
  if (!values || values.length === 0) {
    return null;
  }

  return (
    <section>
      <p>
        <strong>{label}:</strong>{" "}
        {values.map((name) => {
          const slug = slugify(name);
          return (
            <React.Fragment key={slug}>
              <Link to={`/${prefix}/${slug}/`}>{name}</Link>{" "}
            </React.Fragment>
          );
        })}
      </p>
    </section>
  );
};

export default Tags;
