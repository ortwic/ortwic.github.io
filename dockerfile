FROM ruby:3.2

RUN apt-get update && apt-get install -y \
    build-essential \
    nodejs \
    git

WORKDIR /workspace

RUN gem install bundler jekyll

COPY Gemfile* ./
RUN bundle install || true

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--livereload"]