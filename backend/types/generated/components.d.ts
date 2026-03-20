import type { Schema, Struct } from '@strapi/strapi';

export interface CollegeFaculty extends Struct.ComponentSchema {
  collectionName: 'components_college_faculties';
  info: {
    description: 'Faculty member of a college';
    displayName: 'Faculty';
    icon: 'user';
  };
  attributes: {
    Department: Schema.Attribute.String;
    Designation: Schema.Attribute.String & Schema.Attribute.Required;
    Image: Schema.Attribute.Media<'images'>;
    Name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProgramCareerPath extends Struct.ComponentSchema {
  collectionName: 'components_program_career_paths';
  info: {
    description: 'A career outcome with title and salary';
    displayName: 'Career Path';
    icon: 'briefcase';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    SalaryRange: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProgramCourseItem extends Struct.ComponentSchema {
  collectionName: 'components_program_course_items';
  info: {
    description: 'A course within a program curriculum';
    displayName: 'Course Item';
    icon: 'book';
  };
  attributes: {
    Code: Schema.Attribute.String;
    Credits: Schema.Attribute.String;
    Description: Schema.Attribute.Text & Schema.Attribute.Required;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProgramHighlightItem extends Struct.ComponentSchema {
  collectionName: 'components_program_highlight_items';
  info: {
    description: 'A key differentiator or selling point';
    displayName: 'Highlight Item';
    icon: 'check-circle';
  };
  attributes: {
    Description: Schema.Attribute.Text & Schema.Attribute.Required;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProgramStatHighlight extends Struct.ComponentSchema {
  collectionName: 'components_program_stat_highlights';
  info: {
    description: 'A key statistic or metric for the program';
    displayName: 'Stat Highlight';
    icon: 'trending-up';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Label: Schema.Attribute.String & Schema.Attribute.Required;
    Value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProgramTestimonialItem extends Struct.ComponentSchema {
  collectionName: 'components_program_testimonial_items';
  info: {
    description: 'A student or alumni testimonial';
    displayName: 'Testimonial Item';
    icon: 'message-circle';
  };
  attributes: {
    Name: Schema.Attribute.String & Schema.Attribute.Required;
    Photo: Schema.Attribute.Media<'images'>;
    Quote: Schema.Attribute.Text & Schema.Attribute.Required;
    Role: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'college.faculty': CollegeFaculty;
      'program.career-path': ProgramCareerPath;
      'program.course-item': ProgramCourseItem;
      'program.highlight-item': ProgramHighlightItem;
      'program.stat-highlight': ProgramStatHighlight;
      'program.testimonial-item': ProgramTestimonialItem;
    }
  }
}
