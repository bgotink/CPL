require 'rubygems'
require 'fileutils'
require 'digest/md5'
require 'redcarpet'
require 'pygments'

PYGMENTS_CACHE_DIR = File.expand_path('../../_cache', __FILE__)
FileUtils.mkdir_p(PYGMENTS_CACHE_DIR)

class Redcarpet2Markdown < Redcarpet::Render::XHTML

  def block_code(code, lang)
puts(code)
    lang = lang || "text"
    path = File.join(PYGMENTS_CACHE_DIR, "#{lang}-#{Digest::MD5.hexdigest code}.html")
    cache(path) do
      colorized = Pygments.highlight(code, lang.downcase)
      add_code_tags(colorized, lang)
    end
  end

  def add_code_tags(code, lang)
    code.sub(/<pre>/, "<pre><code class=\"#{lang}\">").
         sub(/<\/pre>/, "</code></pre>")
  end

  def cache(path)
    if File.exist?(path)
      File.read(path)
    else
      content = yield
      File.open(path, 'w') {|f| f.print(content) }
      content
    end
  end
end

inp = File.read(ARGV[0])

outp = File.open(ARGV[1], 'w')

converter = Redcarpet::Markdown.new(Redcarpet2Markdown,
	 :fenced_code_blocks => true)

outp.print("<html><head><link href=\"./test.css\" type=\"text/css\" rel=\"stylesheet\" /></head><body>")
outp.print(converter.render(inp))
outp.print("</body></html>")
